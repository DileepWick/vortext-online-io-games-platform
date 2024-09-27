import { Chip } from "@nextui-org/react"; // Ensure Chip is imported from your UI library

const genreEmojis = {
  Action: "⚔️",
  Adventure: "🐾",
  Racing: "🏎️",
  Puzzle: "🧩",
  Fighting: "🥷🏻",
  Strategy: "🙄",
  Sport: "🏅",
};

const GenreChips = ({ genres }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2 text-white">
      {genres.flatMap((genre) =>
        genre.includes(",") ? genre.split(",") : genre
      ).map((genre, index) => {
        const trimmedGenre = genre.trim();
        const emoji = genreEmojis[trimmedGenre] || "";

        return (
          <Chip
            key={index}
            color="default"
            variant="bordered"
            size="lg"
            radius="none"
            className="font-primaryRegular text-white flex items-center"
          >
            {emoji} {trimmedGenre.charAt(0).toUpperCase() + trimmedGenre.slice(1)}
          </Chip>
        );
      })}
    </div>
  );
};

export default GenreChips;
