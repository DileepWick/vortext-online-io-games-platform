import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import { toast, Flip } from "react-toastify";
import { ScrollShadow } from "@nextui-org/react";

export const AddNewEdition = ({ callBackFunction }) => {
  // Test userid
  const creator = "668b77871e70dfeda9770729";

  // State variables
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", hint: "", answer: "" },
  ]);

  // Modal
  const {
    isOpen: isEditionModalOpen,
    onOpen: onEditionModalOpen,
    onClose: onEditionModalClose,
  } = useDisclosure();

  // Handle Question Changes
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  // Add New Question
  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", hint: "", answer: "" }]);
  };

  // Save new edition
  const saveNewEdition = async (e) => {
    e.preventDefault();

    const newEdition = {
      title: quizTitle,
      questions,
      creator, // Include userId in the new edition data
    };

    try {
      const response = await axios.post(
        `http://localhost:8098/spookeyEditons/addNewEdition`,
        newEdition
      );

      if (response.status === 200) {
        toast.success(response.data.message, {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
        callBackFunction();
        onEditionModalClose();
      } /*else {
        // Handle non-success statuses (e.g., 400, 404) if needed
        toast.error("Unexpected response status.", {
          theme: "dark",
          transition: Flip,
          style: { fontFamily: "Rubik" },
        });
      }*/
    } catch (error) {
      /*toast.error("Error occurred while adding edition.", {
        theme: "dark",
        transition: Flip,
        style: { fontFamily: "Rubik" },
      });*/
    }

    // Clear form after submission
    setQuizTitle("");
    setQuestions([{ question: "", hint: "", answer: "" }]);
  };

  // Handle Button Click
  const handleEditionButton = () => {
    onEditionModalOpen();
  };

  return (
    <div>
      <Button
        variant="bordered"
        onClick={handleEditionButton}
        size="lg"
        className="bg-customPink text-white"
      >
        Custom Edition +
      </Button>
      {/* Modal */}
      <Modal
        isOpen={isEditionModalOpen}
        size="lg"
        onOpenChange={onEditionModalClose}
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent className="font-primaryRegular p-4">
          <ModalHeader className="text-3xl font-scary2">Custom Edition</ModalHeader>
          <ModalBody>
            <form onSubmit={saveNewEdition}>
              <Input
                label="Edition Title"
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
              <ScrollShadow className="w-[450px] h-[400px]">
                {questions.map((question, index) => (
                  <div key={index} className="mt-8">
                    <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                    <Input
                      label="Question"
                      type="text"
                      size="sm"
                      className="mb-2"
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(index, "question", e.target.value)
                      }
                    />
                    <Input
                      label="Hint"
                      type="text"
                      size="sm"
                      className="mb-2"
                      value={question.hint}
                      onChange={(e) =>
                        handleQuestionChange(index, "hint", e.target.value)
                      }
                    />
                    <Input
                      label="Answer"
                      type="text"
                      size="sm"
                      value={question.answer}
                      onChange={(e) =>
                        handleQuestionChange(index, "answer", e.target.value)
                      }
                    />
                  </div>
                ))}
              </ScrollShadow>
              <Button
                size="sm"
                color="default"
                onClick={handleAddQuestion}
                className="mt-8"
              >
                Add Another Question
              </Button>
              <Button type="submit" color="danger" className="mt-4 ml-4" size="sm">
                Save Edition
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AddNewEdition;
