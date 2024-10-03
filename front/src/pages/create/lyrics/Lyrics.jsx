import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTermState, userState } from '../../../store/atoms';
import { getUsers } from '../../../apis/userApi';
import { useRecoilState } from 'recoil';
import axiosInstance from '../../../apis/axiosInstance';
import '../../../styles/Survey.css';

function Lyrics() {
  const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
  const [preferLatest, setPreferLatest] = useState(true); // 기본값 true
  const [playlistTitle, setPlaylistTitle] = useState('제목 없음'); // 기본값 "제목 없음"
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [user, setUser] = useRecoilState(userState); // 사용자 상태 관리
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUsers();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      searchTerm,
      prefer_latest: preferLatest,
      userId: user?.id, // userId를 userState에서 가져옴
      title: playlistTitle || '제목 없음', // 빈 문자열일 경우 "제목 없음" 설정
    };

    try {
      console.log('서버가 받을 데이터:', postData);
      const response = await axiosInstance.post('/lyrics-playlist', postData);
      console.log('Server response:', response.data);
      navigate('/myplaylist', { state: { playlist: response.data.playlist } });
    } catch (error) {
      console.error('Error submitting lyrics:', error);
    }
  };

  return (
    <div className='background-survey'>
      <h1 className='survey-title'>SURVEY</h1>
      <p className='instruction'>좋아하는 가사를 입력해주세요.</p>
      <form className='lyrics-form' onSubmit={handleSubmit}>
        <input type='text' className='transparent-input' placeholder='가사를 입력하세요' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <button type='button' className='submit-button' onClick={() => setIsModalOpen(true)}>
          옵션 설정
        </button>

        <button type='submit' className='submit-button'>
          플레이리스트 생성하기
        </button>
      </form>

      {/* 선택창 모달 */}
      {isModalOpen && (
        <div className='modal'>
          <div className='modal-content'>
            <h2>플레이리스트 옵션 설정</h2>

            <input type='text' className='modal-input' placeholder='플레이리스트 제목 (선택사항)' value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value || '')} />

            <label className='checkbox-label'>
              <input className='checkbox' type='checkbox' checked={preferLatest} onChange={(e) => setPreferLatest(e.target.checked)} />
              최신곡을 선호합니다!
            </label>

            <button className='modal-close' onClick={() => setIsModalOpen(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lyrics;