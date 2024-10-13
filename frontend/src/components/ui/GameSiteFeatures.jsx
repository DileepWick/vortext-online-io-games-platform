import { cn } from "../../libs/util";
import {
  Gamepad2,
  Headphones,
  Users,
  Cloud,
  Package,
  Heart,
  Coins,
  Settings,
} from "lucide-react";

export function GameSiteFeatures() {
  const features = [
    {
      title: "Play Online Games",
      description:
        "Access a wide variety of games to play instantly in your browser.",
      icon: <Gamepad2 />,
    },
    {
      title: "24/7 Customer Support",
      description:
        "Our dedicated support team is always available to assist you.",
      icon: <Headphones />,
    },
    {
      title: "Vibrant Community",
      description:
        "Connect with fellow gamers, join clans, and make new friends.",
      icon: <Users />,
    },
    {
      title: "Cloud Gaming",
      description:
        "Play high-end games on any device with our cloud gaming service.",
      icon: <Cloud />,
    },
    {
      title: "Exclusive Game Content",
      description:
        "Unlock special in-game content available only on our platform.",
      icon: <Package />,
    },
    {
      title: "Exclusive Rewards",
      description:
        "Earn points and unlock special rewards as you play and level up.",
      icon: <Coins />,
    },
    {
      title: "Customizable Experience",
      description:
        "Personalize your gaming profile and preferences to your liking.",
      icon: <Settings />,
    },
    {
      title: "Game Recommendations",
      description:
        "Discover new games tailored to your interests and playstyle.",
      icon: <Heart />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto bg-black">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({ title, description, icon, index }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-400 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-white dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-400 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

export default GameSiteFeatures;
