import React, { useState, useEffect, useCallback } from 'react';
import { MdAdd } from 'react-icons/md';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import AddEditNotes from './AddEditNotes';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import axiosInstance from '../utils/axiosInstance';

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });
  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });
  const [allNotes, setAllNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Toast message handler
  const showToastMessage = useCallback((message, type) => {
    setShowToastMsg({ isShown: true, message, type });
  }, []);

  const handleCloseToast = useCallback(() => {
    setShowToastMsg(prev => ({ ...prev, isShown: false }));
  }, []);

  // Fetch user info
  const getUserInfo = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data?.user) setUserInfo(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  }, [navigate]);

  // Fetch all notes
  const getAllNotes = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/get-all-notes');
      if (response.data?.notes) {
        setAllNotes(response.data.notes);
        setFilteredNotes(response.data.notes);
      }
    } catch (error) {
      showToastMessage("Error fetching notes", "delete");
    }
  }, [showToastMessage]);

  // Delete note
  const deleteNote = useCallback(async (data) => {
    try {
      await axiosInstance.delete(`/delete-note/${data._id}`);
      showToastMessage("Note deleted successfully", "delete");
      getAllNotes();
    } catch (error) {
      showToastMessage(error.response?.data?.message || "Delete failed", "delete");
    }
  }, [getAllNotes, showToastMessage]);

  // Real-time search function
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredNotes(allNotes);
      setIsSearch(false);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = allNotes.filter(note => {
      return (
        note.title.toLowerCase().includes(lowerCaseQuery) ||
        note.content.toLowerCase().includes(lowerCaseQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
      );
    });

    setFilteredNotes(results);
    setIsSearch(true);
  }, [allNotes]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setFilteredNotes(allNotes);
    setIsSearch(false);
  }, [allNotes]);

  // Pin/unpin note
  const updateIsPinned = useCallback(async (noteData) => {
    try {
      const response = await axiosInstance.put(
        `/update-note-pinned/${noteData._id}`,
        { isPinned: !noteData.isPinned }
      );
      if (response.data?.note) {
        showToastMessage("Note updated successfully");
        getAllNotes();
      }
    } catch (error) {
      showToastMessage("Update failed", "delete");
    }
  }, [getAllNotes, showToastMessage]);

  // Initial data fetch
  useEffect(() => {
    getUserInfo();
    getAllNotes();
    Modal.setAppElement('#root');
  }, [getAllNotes, getUserInfo]);

  return (
    <>
      <Navbar 
        userInfo={userInfo}  
        onSearchNote={handleSearch} 
        handleClearSearch={handleClearSearch}
        allNotes={allNotes}
        searchQuery={searchQuery}
      />

      <div className='container mx-auto px-4 py-6'>
        {filteredNotes.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {[...filteredNotes]
              .sort((a, b) => (b.isPinned - a.isPinned))
              .map((item) => (
                <NoteCard
                  key={item._id}
                  title={item.title}
                  date={item.createdOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => setOpenAddEditModal({ 
                    isShown: true, 
                    type: 'edit', 
                    data: item 
                  })}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateIsPinned(item)}
                />
              ))}
          </div>
        ) : (
          <EmptyCard 
            message={isSearch 
              ? "No notes found matching your search" 
              : "Start creating your first note!"}
          />
        )}
      </div>

      {/* Add Note Floating Button */}
      <button
        className='fixed right-6 bottom-6 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-105'
        onClick={() => setOpenAddEditModal({ isShown: true, type: 'add', data: null })}
        aria-label='Add new note'
      >
        <MdAdd className='text-2xl' />
      </button>

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: 'add', data: null })}
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(2px)',
          },
        }}
        contentLabel='Note Modal'
        className='w-[95%] sm:w-[80%] md:w-[70%] lg:w-[50%] xl:w-[40%] max-h-[85vh] bg-white rounded-xl mx-auto mt-10 p-6 overflow-auto shadow-2xl'
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => setOpenAddEditModal({ isShown: false, type: 'add', data: null })}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      {/* Toast Notification */}
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;