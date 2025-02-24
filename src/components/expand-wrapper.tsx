import {
  Modal,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { PropsWithChildren, useState } from "react";

export const ExpandWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        className="relative"
        style={{
          position: "relative",
        }}
      >
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          closeOnOverlayClick
        >
          <ModalOverlay></ModalOverlay>

          <ModalContent
            backgroundColor="transparent"
            style={{ background: "orange !important" }}
          >
            <div
              style={{
                width: "100vw",
                height: "100vh",
                position: "fixed",
                left: "0",
                top: "0",
                zIndex:"1",
                // transform: "translate(-50%,-50%)",
              }}
              className="h-screen w-screen"
            >
              <div
                style={{
                  position: "absolute",
                  right: "1.5rem",
                  top: "23px",
                  cursor: "pointer",
                  zIndex: "1",
                }}
                onClick={() => setIsOpen(false)}
              >
                <img style={{ width: "20px" }} src="/Cross.svg" />
              </div>
              <div className="box" style={{ paddingBottom: "5rem" }}>
                {children}
              </div>
            </div>
          </ModalContent>
        </Modal>
        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "4px",
            cursor: "pointer",
            zIndex: "2",
          }}
          onClick={() => setIsOpen(true)}
        >
          <img
            style={{ width: "20px", filter: "brightness(0)" }}
            src="/Expand.png"
          />
        </div>
        {children}
      </div>
    </>
  );
};
