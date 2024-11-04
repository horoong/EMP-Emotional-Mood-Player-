import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '../../../store/atoms';
import axiosInstance from '../../../apis/axiosInstance';
import '../../../styles/Questionnaire.css';

function Questionnaire() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({
    song_types: [],
    genres: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [preferLatest, setPreferLatest] = useState(true);
  const [isQuestionnaireDone, setIsQuestionnaireDone] = useState(false);
  const user = useRecoilValue(userState); // 사용자 상태 읽기
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const questions = [
    {
      question: '현재의 기분을 선택해주세요.',
      answers: ['행복해요😊', '슬퍼요😢', '차분해요😌', '화나요😠', '신나요🤩', '피곤해요😴', '외로워요🥺', '사랑에빠졌어요❤️'],
    },
    {
      question: '선호하는 음악의 장르는 무엇인가요?',
      answers: ['발라드🎼', '댄스/팝🎶', '포크/어쿠스틱🎸', '아이돌🌟', '랩/힙합🎧', '알앤비/소울🎵', '일렉트로닉🎹', '락/메탈🤘', '재즈🎷', '인디🌿', '성인가요😎'],
    },
    {
      question: '이 순간에 어울리는 가사의 테마는 무엇인가요?',
      answers: ['사랑과 연애💑', '이별과 그리움💔', '꿈과 희망🌟', '자기 성찰과 성장🌱', '우정과 가족👨‍👩‍👧‍👦', '자유와 모험🏞️', '극복과 도전🏅'],
    },
  ];

  const songTypesMapping = {
    사랑: ['사랑에빠졌어요', '사랑과 연애', '우정과 가족'],
    슬픔: ['슬퍼요', '외로워요', '이별과 그리움'],
    설레임: ['행복해요', '신나요', '꿈과 희망', '자기 성찰과 성장', '자유와 모험'],
    이별: ['이별과 그리움'],
    초조함: ['화나요', '차분해요', '피곤해요', '극복과 도전'],
  };

  const genresMapping = {
    adultkpop: ['성인가요'],
    ballad: ['발라드'],
    dance: ['댄스/팝'],
    elec: ['일렉트로닉'],
    folk: ['포크/어쿠스틱'],
    idol: ['아이돌'],
    indie: ['인디'],
    jazz: ['재즈'],
    rnh: ['랩/힙합'],
    rns: ['알앤비/소울'],
    rock: ['락/메탈'],
  };

  const handleAnswerClick = (answer) => {
    const questionIndex = currentQuestion;

    if (questionIndex === 0 || questionIndex === 2) {
      setSelectedAnswers((prev) => ({
        ...prev,
        song_types: [...prev.song_types, removeEmojis(answer)],
      }));
    } else if (questionIndex === 1) {
      setSelectedAnswers((prev) => ({
        ...prev,
        genres: removeEmojis(answer),
      }));
    }

    setAnswers([...answers, answer]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsQuestionnaireDone(true);
    }
  };

  const removeEmojis = (text) => {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '')
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '');
  };

  const handleSubmit = async () => {
    const { song_types, genres } = selectedAnswers;

    const mappedSongTypes = Object.keys(songTypesMapping).filter((key) => song_types.some((type) => songTypesMapping[key].includes(type)));

    const mappedGenres = Object.keys(genresMapping).find((key) => genresMapping[key].includes(genres));

    const mappedData = {
      genres: mappedGenres,
      song_types: mappedSongTypes,
      prefer_latest: preferLatest,
      userId: user?.id,
      title: playlistTitle || '제목 없음',
    };

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post('/playlists/recommend/emotion', mappedData);
      navigate('/myplaylist', { state: { playlist: response.data } });
    } catch (error) {
      console.error('데이터 제출 중 오류:', error.response?.data || error.message);
      let errorMessage = '플레이리스트 생성 중 오류가 발생했습니다.';
      if (error.response && error.response.data && error.response.data.details) {
        errorMessage += ` ${error.response.data.details}`;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='questionnaire-container'>
      {!isQuestionnaireDone ? (
        <div className='question-slide'>
          <p className='instruction'>{questions[currentQuestion].question}</p>
          <div className='answers'>
            {questions[currentQuestion].answers.map((answer, index) => (
              <button key={index} className='answer-button' onClick={() => handleAnswerClick(answer)}>
                {answer}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className='final-options'>
          <button type='button' className='submit-button' onClick={() => setIsModalOpen(true)}>
            옵션 설정
          </button>
          <button type='button' className='submit-button' onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? '생성 중...' : '플레이리스트 생성하기'}
          </button>
        </div>
      )}

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

export default Questionnaire;
