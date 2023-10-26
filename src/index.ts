import { Status } from "./types";

export interface Env {
  GROUP_SLUG: string;
  DISCORD_API_TOKEN: string;
  DISCORD_CHANNEL: string;
  OPENAI_SECRET_KEY: string;
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const { currentAlbum } = await getCurrent(env.GROUP_SLUG);

    const introduction = await introduce(
      env.OPENAI_SECRET_KEY,
      currentAlbum.artist,
      currentAlbum.name,
    );

    await discord(
      env.DISCORD_API_TOKEN,
      env.DISCORD_CHANNEL,
      "",
      [
        {
          type: 1,
          components: [
            {
              style: 5,
              label: "Listen on Spotify",
              url: `http://open.spotify.com/album/${currentAlbum.spotifyId}`,
              disabled: false,
              type: 2,
            },
            {
              style: 5,
              label: "Read more on Wikipedia",
              url: currentAlbum.wikipediaUrl,
              disabled: false,
              type: 2,
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              style: 5,
              label: "Join the Group",
              url: `https://1001albumsgenerator.com/?joinGroup=${env.GROUP_SLUG}`,
              disabled: false,
              type: 2,
            },
          ],
        },
      ],
      [
        {
          type: "rich",
          title: "1001 Albums You Must Hear",
          description: introduction,
          color: 0xbf1c2e,
          fields: [
            {
              name: "Artist:",
              value: `\`${currentAlbum.artist}\``,
            },
            {
              name: `Album:`,
              value: `\`${currentAlbum.name}\``,
            },
            {
              name: `Genre:`,
              value: `\`${currentAlbum.genres.join("`, ")}\``,
            },
            {
              name: `Released:`,
              value: `\`${currentAlbum.releaseDate}\``,
            },
          ],
          thumbnail: {
            url: currentAlbum.images[0].url,
            height: currentAlbum.images[0].height,
            width: currentAlbum.images[0].width,
          },
        },
      ],
    );
  },
};

const getCurrent = async (group: string): Promise<Status> => {
  const response = await fetch(
    `https://1001albumsgenerator.com/api/v1/groups/${group}`,
  );

  return await response.json<Status>();
};

const discord = async (
  token: string,
  channel: string,
  content: string,
  components: any[] = [],
  embeds: any[] = [],
): Promise<Response> =>
  await fetch(`https://discord.com/api/v10/channels/${channel}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${token}`,
    },
    body: JSON.stringify({
      channel_id: channel,
      content,
      components,
      embeds,
    }),
  });

const introduce = async (
  token: string,
  artist: string,
  album: string,
): Promise<string> => {
  const prompt = `You are a Radio DJ. The Radio station is listened to by Software Developers. You're about to introduce the next album coming up which is "${album}" by ${artist}. The introduction should be brief to save the listeners time`;

  const response = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 200,
      n: 1,
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI unavailable");
  }

  const body = await response.json<{
    choices: {
      text: string;
    }[];
  }>();

  // ChatGPT wrote it's own parser, it removes the repeated prompt, and random junk often prepended to the response
  let text = body.choices[0].text.trim();

  // Remove leading newlines and full stops
  text = text.replace(/^[\n.]+/, "");

  // Remove prompt words
  prompt.split(" ").forEach((word) => {
    if (text.startsWith(word)) {
      text = text.slice(word.length);
    }
  });

  return text.trim();
};
