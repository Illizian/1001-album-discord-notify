export type Status = {
  currentAlbum: Album;
  latestAlbum: Album;
  highestRatedAlbum: Album[];
  lowestRatedAlbum: Album[];
  favouriteGenres: Rating[];
  worseGenres: Rating[];
};

type Album = {
  artist: string;
  artistOrigin: string;
  images: AlbumImage[];
  genres: string[];
  subGenres: string[];
  name: string;
  slug: string;
  releaseDate: number;
  globalReviewsUrl: string;
  wikipediaUrl: string;
  spotifyId: string;
  appleMusicId: string;
  tidalId: string;
  amazonMusicId: string;
  youtubeMusicId: string;
  votes: number;
  totalRating: number;
  averageRating: number;
  listenedAt: number;
};

type AlbumImage = {
  height: number;
  url: string;
  width: number;
};

type Rating = {
  numberOfAlbums: number;
  totalRating: number;
  votes: number;
  genre: string;
  rating: number;
  numberOfVotes: number;
};
