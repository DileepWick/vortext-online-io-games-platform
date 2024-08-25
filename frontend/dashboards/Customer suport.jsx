import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../src/components/header";
import useAuthCheck from "../src/utils/authCheck";
import {
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@nextui-org/react";
import { Flip, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../src/components/footer";

const ContactDash = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add state for edit modal
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Add state for the FAQ being edited
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get("http://localhost:8098/faq/fetchFAQ");
        if (response.data && response.data.allFAQs) {
          setFaqs(response.data.allFAQs);
        } else {
          setFaqs([]);
        }
      } catch (err) {
        setError("Failed to fetch FAQs");
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleAddFAQ = async () => {
    try {
      const response = await axios.post("http://localhost:8098/faq/createFAQ", {
        question: newQuestion,
        answer: newAnswer,
      });

      if (response.data && response.data.newFAQ) {
        setFaqs((prevFaqs) => [...prevFaqs, response.data.newFAQ]);
        toast.success("FAQ Added", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          progressBarClassName: "bg-gray-800",
          style: { fontFamily: "Rubik" },
        });
      }
      setNewQuestion("");
      setNewAnswer("");
      onAddOpenChange(false); // Close the add modal
      setActiveTab("FAQ"); // Switch back to the FAQ tab
    } catch (error) {
      console.error("Error adding FAQ:", error);
      setError("Failed to add FAQ");
      toast.error("Failed to add FAQ.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        progressBarClassName: "bg-gray-800",
        style: { fontFamily: "Rubik" },
      });
    }
  };

  const handleUpdateFAQ = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8098/faq/updateFAQ/${editingFAQ._id}`,
        {
          question: editQuestion,
          answer: editAnswer,
        }
      );

      if (response.data && response.data.updatedFAQ) {
        setFaqs((prevFaqs) =>
          prevFaqs.map((faq) =>
            faq._id === response.data.updatedFAQ._id
              ? response.data.updatedFAQ
              : faq
          )
        );
        toast.success("FAQ Updated", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Flip,
          progressBarClassName: "bg-gray-800",
          style: { fontFamily: "Rubik" },
        });
      }
      setEditQuestion("");
      setEditAnswer("");
      setEditingFAQ(null);
      onEditOpenChange(false); // Close the edit modal
    } catch (error) {
      console.error("Error updating FAQ:", error);
      setError("Failed to update FAQ");
      toast.error("Failed to update FAQ.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        progressBarClassName: "bg-gray-800",
        style: { fontFamily: "Rubik" },
      });
    }
  };

  const handleDeleteFAQ = async (faqId) => {
    try {
      await axios.delete(`http://localhost:8098/faq/deleteFAQ/${faqId}`);
      setFaqs(faqs.filter((faq) => faq._id !== faqId));
      toast.success("FAQ Deleted", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        progressBarClassName: "bg-gray-800",
        style: { fontFamily: "Rubik" },
      });
    } catch {
      setError("Failed to delete FAQ.");
      toast.error("Failed to delete FAQ.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        progressBarClassName: "bg-gray-800",
        style: { fontFamily: "Rubik" },
      });
    }
  };

  return (
    <div>
      <Header />
      <div className="flex w-full flex-col dark text-foreground bg-background">
        <div className="flex items-center p-4 font-primaryRegular">
          <Tabs
            aria-label="Blogger Tabs"
            className="flex-1"
            onSelectionChange={setActiveTab}
            selectedKey={activeTab}
            size="lg"
            color="primary"
          >
            <Tab key="tab1" title="Direct Messages" />
            <Tab key="FAQ" title="FAQ" />
            <Tab key="tab3" title="Contact Us" />
            <Tab key="tab4" title="T4" />
          </Tabs>
        </div>
        <div className="p-4">
          {activeTab === "tab1" && <div>{/* Add your content here */}</div>}
          {activeTab === "FAQ" && (
            <div>
              <Button
                className="bg-primary text-foreground "
                onPress={onAddOpen}
              >
                Add New
              </Button>
              <Modal
                isOpen={isAddOpen}
                onOpenChange={onAddOpenChange}
                className="dark text-foreground bg-background"
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Add New FAQ
                      </ModalHeader>
                      <ModalBody>
                        <Input
                          label="Question"
                          placeholder="Enter the question"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          fullWidth
                        />
                        <Textarea
                          label="Answer"
                          placeholder="Enter the answer"
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          fullWidth
                        />
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Cancel
                        </Button>
                        <Button color="primary" onPress={handleAddFAQ}>
                          Add FAQ
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              <Modal
                isOpen={isEditOpen}
                onOpenChange={onEditOpenChange}
                className="dark text-foreground bg-background"
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Edit FAQ
                      </ModalHeader>
                      <ModalBody>
                        <Input
                          label="Question"
                          placeholder="Enter the question"
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          fullWidth
                        />
                        <Textarea
                          label="Answer"
                          placeholder="Enter the answer"
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          fullWidth
                        />
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Cancel
                        </Button>
                        <Button color="primary" onPress={handleUpdateFAQ}>
                          Update FAQ
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              {loading ? (
                <Spinner />
              ) : error ? (
                <p className="text-red-500 text-center">Error: {error}</p>
              ) : faqs.length === 0 ? (
                <p className="text-center text-gray-400">No FAQs available</p>
              ) : (
                <Table
                  aria-label="Example static collection table"
                  className="mt-4"
                >
                  <TableHeader className="bg-foreground">
                    <TableColumn>QUESTION</TableColumn>
                    <TableColumn>ANSWER</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq) =>
                      faq ? (
                        <TableRow key={faq._id}>
                          <TableCell width={350}>{faq.question}</TableCell>
                          <TableCell>{faq.answer}</TableCell>
                          <TableCell width={220}>
                            <Button
                              color="primary"
                              className="mr-2"
                              onPress={() => {
                                setEditingFAQ(faq);
                                setEditQuestion(faq.question);
                                setEditAnswer(faq.answer);
                                onEditOpen();
                              }}
                            >
                              Update
                            </Button>
                            <Button
                              color="danger"
                              onPress={() => handleDeleteFAQ(faq._id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : null
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
          {activeTab === "tab3" && <div>Tab3</div>}
          {activeTab === "tab4" && <div>Tab4</div>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactDash;
