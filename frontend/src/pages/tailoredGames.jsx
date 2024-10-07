// src/pages/TailoredGames.jsx
import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { Card, CardBody, User } from "@nextui-org/react";
import { Link } from "react-router-dom";
import GameStartIcon from "../assets/icons/Game_Start";

const TailoredGames = () => {
  // Reusable GameCard component defined within the same file
  const GameCard = ({ title, imageUrl, link, devName, devId, devPicUrl }) => {
    return (
      <Card className="relative bg-black border border-gray-700 rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-opacity-80 w-full max-w-[270px] h-[450px]">
        <Link
          to={link}
          className="relative block focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="relative">
            <img
              className="w-full h-72 object-cover"
              src={imageUrl}
              alt={title}
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
              <GameStartIcon />
            </div>
          </div>

          <CardBody className="p-4">
            <p className="mb-2 font-primaryRegular text-xl text-white text-center mb-8">
              {title}
            </p>
            <User
              className="text-white"
              name={devName}
              description={devId}
              avatarProps={{
                src: devPicUrl,
              }}
            />
          </CardBody>
        </Link>
      </Card>
    );
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
          {/* Game 1 */}
          <GameCard
            title="The Witch's Enigma"
            imageUrl="https://res.cloudinary.com/dhcawltsr/image/upload/v1727701506/5a574b10-dc39-4770-9010-1d0aa3b1c8e4.png"
            link="/HangmanGame"
            devName={"Wickramsinghe M.G.D.D"}
            devId={"IT22056252"}
            devPicUrl={
              "https://res.cloudinary.com/dhcawltsr/image/upload/v1727702080/340636206_739289724364300_6898680733432403275_n_1_djhsuc.jpg"
            }
          />

          {/* Game 2 */}
          <GameCard
            title="Member 2 Game"
            imageUrl="https://images5.alphacoders.com/127/1274050.jpg"
            link="/games/chess"
            devName={"Ranasinghe G.M.N.T.B"}
            devId={"IT22201928"}
          />

          {/* Game 3 */}
          <GameCard
            title="Member 3 Game"
            imageUrl="https://images5.alphacoders.com/127/1274050.jpg"
            link="/games/sudoku"
            devName={"Ariyawansha R.T.L "}
            devId={"IT22077356"}
          />

          {/* Game 4 */}
          <GameCard
            title="Member 4 Game"
            imageUrl="https://images5.alphacoders.com/127/1274050.jpg"
            link="/games/tictactoe"
            devName={"Athauda A.A.D.D "}
            devId={"IT22105820"}
          />
          {/* Game 5 */}
          <GameCard
            title="Member 5 Game"
            imageUrl="https://images5.alphacoders.com/127/1274050.jpg"
            link="/games/tictactoe"
            devName={"Wijekoon W.M.D.P"}
            devId={"IT22103772"}
          />
          {/* Game 6 */}
          <GameCard
            title="Member 6 Game"
            imageUrl="https://images5.alphacoders.com/127/1274050.jpg"
            link="/games/tictactoe"
            devName={"Dissanayaka D.M.K.L.K"}
            devId={"IT22120748"}
          />
          {/* Game 7 */}
          <GameCard
            title="Mathz Blaster"
            imageUrl="https://res.cloudinary.com/dhcawltsr/image/upload/v1728299817/DALLE2024-10-0716.45.01-AsimpleandfunlogoforagamecalledMathBlaster.Thelogoshouldhaveplayfulandbright_myurlb.jpg"
            link="/PuzzlePlatformGame"
            devName={"Dissanayake K.M.S.N.B"}
            devId={"IT22231246"}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TailoredGames;
