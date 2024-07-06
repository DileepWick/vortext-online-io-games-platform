import React from "react";
import "../style/contact.css";
import { Input } from "@nextui-org/input";
import { Textarea } from "@nextui-org/input";
import { Button, ButtonGroup } from "@nextui-org/button";
import Header from "../components/header";
import Footer from "../components/footer";
const Contact = () => {
  return (
    <>
    <Header />
      <div className="contact-container font-primaryRegular">
        <div className="image_container">
          {/* <img src="https://img.freepik.com/free-photo/young-gamer-having-fun-with-action-video-games-competition-playing-online-game-championship-caucasian-woman-enjoying-rpg-play-tournament-live-stream-gaming-modern-computer_482257-47444.jpg?t=st=1719401514~exp=1719402114~hmac=bcfa035925cc37bfebf3fbfce60d89f3fedc8fb76492d8898e9f628ef948c241" /> */}
          <img src="https://res.cloudinary.com/dhcawltsr/image/upload/v1719572048/wallpaperflare.com_wallpaper_3_gpe852.jpg" />
        </div>
        <div className="contact_us_container">
          <div className="w-full flex flex-col gap-8">
            <h1 className="text-3xl">Contact Us:</h1>
            <form className="w-full">
              <Input
                label="Name"
                size="lg"
                type="text"
                labelPlacement="inside"
              />
              <Input
                label="Email"
                className="mt-5"
                size="lg"
                type="email"
                labelPlacement="inside"
              />
              <Textarea
                label="Message"
                labelPlacement="inside"
                className="mt-5"
                size="lg"
              />
              <Button radius="sm" size="md" className="bg-black text-white font-bold mt-14" >Submit</Button>
            </form>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Contact;
