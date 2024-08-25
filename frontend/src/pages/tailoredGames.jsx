import React from 'react'
import Header from '../components/header'
import Hangman from '../components/Games/Hangaman'
import Footer from "../components/footer"

const tailoredGames = () => {
  return (
    <div className='bg-headerDark'>
        <Header/>
        <Hangman/>
        <Footer/>
    </div>
  )
}

export default tailoredGames