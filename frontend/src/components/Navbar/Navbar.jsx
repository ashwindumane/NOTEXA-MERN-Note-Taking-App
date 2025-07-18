import React, { memo, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import ProfileInfo from '../Cards/ProfileInfo'
import SearchBar from '../SearchBar/SearchBar'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

const Navbar = memo(({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const onLogout = useCallback(() => {
    localStorage.clear()
    navigate('/login')
  }, [navigate])

  const handleSearch = useCallback(() => {
    if (searchQuery) onSearchNote(searchQuery)
  }, [searchQuery, onSearchNote])

  const onClearSearch = useCallback(() => {
    setSearchQuery('')
    handleClearSearch()
  }, [handleClearSearch])

  return (
    <div className='bg-white flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 drop-shadow'>
      <div className='flex items-center gap-2'>
        <h2 className='hidden sm:block text-2xl font-bold tracking-wider bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text transition-all duration-300 hover:scale-105'>
          NOTEXA
        </h2>
        <h2 className='sm:hidden text-lg font-extrabold tracking-wide text-indigo-600'>
          NX
        </h2>
      </div>
      <SearchBar 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        handleSearch={handleSearch} 
        onClearSearch={onClearSearch} 
      />
      <div className='flex items-center gap-4 mt-2 sm:mt-0'>
        <a 
          href='https://github.com/ashwindumane' 
          target='_blank' 
          rel='noopener noreferrer' 
          className='text-black hover:text-gray-700 text-xl'
        >
          <FaGithub />
        </a>
        <a 
          href='https://www.linkedin.com/in/ashwindumane/' 
          target='_blank' 
          rel='noopener noreferrer' 
          className='text-blue-600 hover:text-blue-800 text-xl'
        >
          <FaLinkedin />
        </a>
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </div>
  )
})

Navbar.propTypes = {
  userInfo: PropTypes.object,
  onSearchNote: PropTypes.func.isRequired,
  handleClearSearch: PropTypes.func.isRequired
}

export default Navbar
