import React, { useState } from "react";
// Components
import GeneralOverview from "./GeneralOverview";
import VerticalOverview from "./VerticalOverview";
import LocalOverview from "./LocalOverview";

// Logo Sidebar
import Vertical from "../assets/Vertical.svg";
import Local from "../assets/Local.svg";
import ampIcon from "../assets/amp-svgrepo-com.svg";
import testIcon from "../assets/test-svgrepo-com.svg";
import ImageIcon from "../assets/gallery-svgrepo-com.svg";

import General from "../assets/General.svg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import AmpOverview from "./AmpOverview";
import { TestManager } from "./TestManager";
import ImageData from "./ImageData";

const GeneralApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Common style for icons to ensure they appear black
  const iconStyle = {
    marginRight: "10px",
    filter: "brightness(0) saturate(100%)",
  };

  return (
    <div className="app-container flex" style={{ color: "black" }}>
      {/* Fixed message at the top center, no interference (pointerEvents: "none") */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "red",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        Current week calculations are not yet available due to sitemap modifications
      </div>

      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/logo.png" alt="Logo" className="logo" />
          </div>
          <h2 className="title">Digital</h2>
          <h2 className="title">Benchmarks</h2>
          <hr className="separator" />
        </div>

        <button
          className={`tab-button ${activeTab === 0 ? "active" : ""}`}
          onClick={() => setActiveTab(0)}
        >
          <img
            src={General}
            height={10}
            width={20}
            style={iconStyle}
            alt="General Icon"
          />{" "}
          General Overview
        </button>

        <button
          className={`tab-button ${activeTab === 1 ? "active" : ""}`}
          onClick={() => setActiveTab(1)}
        >
          <img
            src={Vertical}
            height={10}
            width={20}
            style={iconStyle}
            alt="Vertical Icon"
          />{" "}
          Vertical Overview
        </button>

        <button
          className={`tab-button ${activeTab === 2 ? "active" : ""}`}
          onClick={() => setActiveTab(2)}
        >
          <img
            src={Local}
            height={10}
            width={20}
            style={iconStyle}
            alt="Local Icon"
          />{" "}
          Local Overview
        </button>

        <button
          className={`tab-button ${activeTab === 3 ? "active" : ""}`}
          onClick={() => setActiveTab(3)}
        >
          <img
            src={ampIcon}
            height={10}
            width={20}
            style={iconStyle}
            alt="AMP Icon"
          />{" "}
          AMP Overview
        </button>

        <button
          className={`tab-button ${activeTab === 4 ? "active" : ""}`}
          onClick={() => setActiveTab(4)}
        >
          <img
            src={testIcon}
            height={10}
            width={20}
            style={iconStyle}
            alt="Test Manager Icon"
          />{" "}
          Test Manager
        </button>

        <button
          className={`tab-button ${activeTab === 5 ? "active" : ""}`}
          onClick={() => setActiveTab(5)}
        >
          <img
            src={ImageIcon}
            height={10}
            width={20}
            style={iconStyle}
            alt="Gallery Icon"
          />{" "}
          Gallery
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

      <div className="content">
        <section
          className={`ContainerSetting ${
            isSidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
        >
          {activeTab === 0 && <GeneralOverview />}
          {activeTab === 1 && <VerticalOverview />}
          {activeTab === 2 && <LocalOverview />}
          {activeTab === 3 && <AmpOverview />}
          {activeTab === 4 && <TestManager />}
          {activeTab === 5 && <ImageData />}
        </section>
      </div>
    </div>
  );
};

export default GeneralApp;
