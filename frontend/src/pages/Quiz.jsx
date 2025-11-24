import PageHeader from "../components/PageHeader";
import { ArrowLeftToLine  } from "lucide-react";
import Nav from "../components/Nav";
import CategorySlider from "../components/CategorySlider";
import { useEffect, useState,useRef } from "react";
import { useCycle } from "framer-motion";
import ProfilePage from "../components/ProfilePage";
import Settings from "../components/Settings";
import './Quiz.css';
import { aiQuizData } from "../../data/aiQuizData";
import { networkingQuizData } from "../../data/networkingQuizData";
import { cyberSecQuizData } from "../../data/cyberSecQuizData";
import { cloudQuizData } from "../../data/cloudQuizData";
import { mlQuizData } from "../../data/mlQuizData";
import { devOpsQuizData } from "../../data/devOpsQuizData";
import { vrQuizData } from "../../data/vrQuizData";
import { softwareDevQuizData } from "../../data/softwareDevQuizData";
import { arQuizData } from "../../data/arQuizData";

import QuizCard from "../components/QuizCard";
import QuizNav from "../components/QuizNav";
import DraftPage from "../components/DraftPage.jsx";
import HelpPage from "../components/HelpPage.jsx";

export default function Quiz(){
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isNotificationBarOpen,cycleNotificationBarOpen]=useCycle(false,true);
    const [isProfilePageOpen, setIsProfilePageOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
   const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openQuiz, setOpenQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizList, setQuizList] = useState([]);
   const [openDraftPage, cycleOpenDraftPage] = useCycle(false,true);
  const [openHelpPage,cycleOpenHelpPage] = useCycle(false,true);

  const handleOpenDraftPage = ()=>{
    cycleOpenDraftPage();
    setIsDropDownOpen(false);
  }
  const handleOpenHelpPage = ()=>{
    cycleOpenHelpPage();
    setIsDropDownOpen(false);
  }


  const handleQuiz =(quizData,quizTitle)=>{
      setOpenQuiz(true);
      setQuizList(quizData);
      setQuizTitle(quizTitle);

  }

   const current = quizList[currentIndex];

  const handleSelect = (answerIndex) => {
    setAnswers({
      ...answers,
      [current.id]: answerIndex,
    });
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < aiQuizData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSubmit = () => {
    console.log("Submitted answers:", answers);
  };

  const openProfilePage = () => {
    setIsProfilePageOpen(true);
    setIsDropDownOpen(false); 
  };
  const openSetting = () => {
    setIsSettingOpen(true);
    setIsDropDownOpen(false);
  };
  const closeProfilePage = () => setIsProfilePageOpen(false);
  const closeSetting=()=> setIsSettingOpen(false);

   const toggleDropDown = () => setIsDropDownOpen((prev) => !prev);
    return(<>
            <div className="quizPage_parent_container">
                <PageHeader
                        isOnCreatePost={false}
                        isOnSearchBar={false}
                        // onPostCreated={fetchPost}
                        isDropDownOpen={isDropDownOpen}
                        toggleDropDown={toggleDropDown}
                        openProfilePage={openProfilePage}
                        openSetting={openSetting}
                        openNotificationBar={isNotificationBarOpen}
                        closeNotificationBar={()=>cycleNotificationBarOpen()}
                        openDraftPage={handleOpenDraftPage}
                        openHelpPage={handleOpenHelpPage}
                        
                      />
                       <ProfilePage
            style={isProfilePageOpen ? "flex" : "none"}
            closeProfilePage={closeProfilePage}
          />
           <DraftPage isDraftPageOn={openDraftPage} closeDraftPage={cycleOpenDraftPage}/>

                      <HelpPage openPage={openHelpPage} closePage={cycleOpenHelpPage}/>
          <Settings style={isSettingOpen ? 'flex' : 'none'}
          closeSetting={closeSetting}/>
                      <div className="quizPage_body_container">
                        <Nav currentPage="quiz" />
                        <div className="quizPage_main_container">
                          <CategorySlider
                                      // onCategoryChange={setSelectedCategory}
                                      // selectedCategory={selectedCategory}
                                    />
                          <div className="quiz_parent_container">
                            <div className="quiz_container_title">Quiz</div>
                            <div className="quiz_container">
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">AI Assessment 1</div>
                                        <div className="quizCard_category">Artificial Intelligence</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz tests your understanding of basic AI concepts, including its purpose, core technologies like machine learning and neural networks, computing needs, real-world applications, and ethical concerns. Answer carefully to assess how well you grasp AI and its role in modern technology.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(aiQuizData,'AI Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                   <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">Cyber Security Assessment 1</div>
                                        <div className="quizCard_category">Cyber Security</div>
                                        
                                      </div>
                                      <div className="quizCard_description">                                      <div className="quizCard_description">This quiz tests your knowledge of basic cybersecurity concepts, including digital threats, protection methods, safe practices, and data security. Answer carefully to assess how well you understand how to stay safe online.</div>
</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(cyberSecQuizData,'Cyber Security Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">Networking Assessment 1</div>
                                        <div className="quizCard_category">Networking</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz evaluates your understanding of fundamental networking concepts, including data transmission, network types, hardware components, and communication protocols. Answer carefully to assess how well you grasp how networks connect and share information.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(networkingQuizData,'Networking Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">Cloud Engineering Assessment 1</div>
                                        <div className="quizCard_category">Cloud Engineering</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz tests your understanding of basic cloud engineering concepts, including cloud services, deployment models, scalability, and infrastructure management. Answer carefully to assess how well you grasp how cloud technologies operate and support modern computing.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(cloudQuizData,'Cloud Engineering Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">Sofware Dev Assessment 1</div>
                                        <div className="quizCard_category">Software Development</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz checks your understanding of fundamental software development concepts, including programming logic, development processes, problem-solving, and code quality. Answer carefully to assess how well you grasp how software is designed and built.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(softwareDevQuizData,'Software Development Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">DevOps Assessment 1</div>
                                        <div className="quizCard_category">DevOps</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz tests your understanding of DevOps fundamentals, including collaboration, automation, continuous integration, and deployment practices. Answer carefully to assess how well you grasp how DevOps improves software delivery.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(devOpsQuizData,'DevOps Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">Machine Learning Assessment 1</div>
                                        <div className="quizCard_category">Machine Learning</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz evaluates your knowledge of basic machine learning concepts, including data-driven training, model improvement, algorithms, and real-world applications. Answer carefully to assess how well you understand how machines learn from data.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(mlQuizData,'Machine Learning Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">VR Assessment 1</div>
                                        <div className="quizCard_category">Virtual Reality</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz checks your understanding of virtual reality concepts, including immersive environments, interactive simulations, and hardware usage. Answer carefully to see how well you grasp how VR creates digital experiences.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(vrQuizData,'Virtual Reality Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  <div className="quiz_card">
                                      <div className="quizCard_header">
                                        <div className="quizCard_title">AR Assessment 1</div>
                                        <div className="quizCard_category">Augmented Reality</div>
                                        
                                      </div>
                                      <div className="quizCard_description">This quiz tests your knowledge of augmented reality fundamentals, including overlaying digital content onto the real world, user interaction, and common applications. Answer carefully to assess your understanding of how AR enhances real-world environments.</div>
                                      <div className="takeQuiz_btn_container"><button className="takeQuiz_btn" onClick={()=>handleQuiz(arQuizData,'Augmented Reality Assessment 1')}>Take Quiz</button></div>
                                  </div>
                                  
                            </div>

                          </div>
                        </div>

                      </div>
            </div>


           

      {openQuiz && current && (<div className="quiz_wrapper" style={{display: openQuiz? 'block':'none'}}>
        <button className="exitQuiz_btn" onClick={()=>setOpenQuiz(false)}><ArrowLeftToLine/>Exit Quiz</button>
      <QuizCard
        title={quizTitle}
        index={currentIndex}
        question={current.question}
        choices={current.choices}
        selectedAnswer={answers[current.id]}
        onSelect={handleSelect}
      />

      <QuizNav 
        onPrev={handlePrev} 
        onNext={handleNext} 
        isLast={currentIndex === aiQuizData.length - 1} 
      />

      {currentIndex === aiQuizData.length - 1 && (
        <button className="submit_btn" onClick={handleSubmit}>
          Submit
        </button>
      )}
    </div>)}
    </>);
}