import { useState, useRef, useEffect } from "react";
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import "./App.css";
import Response from "./Component/Response";
import { Spinner } from "react-bootstrap";
import Status from "./Component/Status";
import "boxicons/css/boxicons.min.css";

function App() {
  // states section
  const [recordState, setRecordState] = useState(null);
  const [blob, setBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState(null);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Tekan dan tahan untuk mulai merekam");
  const [bg, setBg] = useState("primary");
  const [prediction, setPrediction] = useState([]);

  const server = process.env.REACT_APP_SERVER;

  // refs section
  const uploadRef = useRef(null);
  const placeholderRef = useRef(null);
  const micRef = useRef(null);
  const AudioReactRecorderRef = useRef(null);

  // effects section
  useEffect(() => {
    if (isRecorded) {
      uploadRef.current.click();
    }
  }, [isRecorded]);

  // handlers section
  const startRecording = () => {
    setRecordState(RecordState.START);
    setIsRecording(true);
    // reset all
    setBlob(null);
    setResponse(null);
    setPrediction([]);
    setIsRecorded(false);
    setIsSubmitted(false);
    setLoading(false);
    setStatus("Merekam, lepas untuk mengakhiri");
    setBg("danger");
    micRef.current.style.color = "var(--bs-danger)";
    AudioReactRecorderRef.current.style.display = "unset";
  };

  const stopRecording = () => {
    setRecordState(RecordState.STOP);
    setIsRecording(false);
  };

  const handleStopRecording = (audioData) => {
    console.log(typeof audioData);
    setBlob(audioData);
    setIsRecorded(true);
    micRef.current.style.color = "var(--bs-light)";
    AudioReactRecorderRef.current.style.display = "none";
  };

  function blobToBase64(fileBlob) {
    const reader = new FileReader();
    reader.readAsDataURL(fileBlob);
    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  }

  const handleSubmit = async () => {
    setStatus("Membuat annotasi");
    setBg("warning");

    const file = await blobToBase64(blob.blob);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(server + "/api/v1/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    console.log(data);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
      className="main"
    >
      {/* Recorder section */}
      <div
        className={
          response !== null && isSubmitted
            ? "recorder-container uploaded"
            : "recorder-container"
        }
      >
        <div
          onMouseDown={isRecording ? stopRecording : startRecording}
          onMouseUp={isRecording ? stopRecording : null}
          className="recorder"
        >
          <div ref={AudioReactRecorderRef}>
            <AudioReactRecorder
              backgroundColor="#39C0ED"
              foregroundColor="#FBFBFB"
              state={recordState}
              canvasWidth="200px"
              canvasHeight="200px"
              onStop={handleStopRecording}
            />
          </div>
          <div className="recorder-placeholder" ref={placeholderRef}>
            <i
              className="bx bxs-microphone"
              ref={micRef}
              style={{ fontSize: "120px" }}
            ></i>
          </div>
        </div>
        <Status status={status} bg={bg} />

        {loading && (
          <Spinner
            className="mt-2"
            animation="border"
            role="status"
            variant="light"
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        )}
      </div>

      {/* Buttons section */}
      <div className="buttons">
        <Button ref={uploadRef} onClick={handleSubmit} hidden>
          Upload
        </Button>
      </div>

      {/* Response section */}
      {response !== null && isSubmitted && (
        <Response
          response={response}
          prediction={prediction}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;
