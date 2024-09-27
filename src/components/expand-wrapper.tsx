import {
  AlertDialog,
  AlertDialogBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { PropsWithChildren, useRef, useState } from "react";

export const ExpandWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
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
                width: "70vw",
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
              }}
              className="h-screen w-screen"
            >
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
          <img style={{ width: "20px" }} src="/Expand.png" />
        </div>
        {children}
      </div>
    </>
  );
};
