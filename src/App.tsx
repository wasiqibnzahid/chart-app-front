import React, { useState } from "react";

// Components
import GeneralOverview from "./Pages/GeneralOverview";
import VerticalOverview from "./Pages/VerticalOverview";
import LocalOverview from "./Pages/LocalOverview";

// Logo Sidebar
import Vertical from "./assets/Vertical.svg"
import Local from "./assets/Local.svg"
import General from "./assets/General.svg"

// Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { AiOutlineArrowRight, AiOutlineArrowLeft } from "react-icons/ai";
import { runJob } from "./data";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app-container flex">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header"  onClick={() => {
          runJob().catch();
          alert("Job running initiated");
        }}>
          <div className="logo-container">
            <img src="/logo.png" alt="Logo" className="logo" />
          </div>
          <h2 className="title">Digital</h2>
          <h2 className="title">Benchmarks</h2>
          <hr className="separator" />
        </div>

        <button
          className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          <img src={General} height={10} width={20} style={{
            marginRight: "10px"
          }} /> General Overview
        </button>

        <button
          className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          <img src={Vertical} height={10} width={20} style={{
            marginRight: "10px"
          }} /> Vertical Overview
        </button>

        <button
          className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => setActiveTab(2)}
        >
          <img src={Local} height={10} width={20} style={{
            marginRight: "10px"
          }} /> Local Overview
        </button>
      </div>


      <button
    className="toggle-sidebar"
    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    style={{
      border: "none",
      outline: "none",
    }}
  >
    {isSidebarOpen ? (
      <FontAwesomeIcon icon={faChevronLeft} />
    ) : (
      <FontAwesomeIcon icon={faChevronRight} />
    )}
  </button>


      {/* <button
        className="toggle-sidebar"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          border:"none",
          outline:"none",
        }}
      >
        {isSidebarOpen ? <AiOutlineArrowLeft /> : <AiOutlineArrowRight />}
      </button> */}

      <div className="content">
        <section
          className={`ContainerSetting ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        >
          {activeTab === 0 && <GeneralOverview />}
          {activeTab === 1 && <VerticalOverview />}
          {activeTab === 2 && <LocalOverview />}
        </section>
      </div>
    </div>
  );
};

export default App;
