import { useState, useRef } from "react";
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Spinner } from "react-bootstrap";
import Status from "./Component/Status";
import axios from "axios";
import "boxicons/css/boxicons.min.css";

function App() {
  // states section
  const [recordState, setRecordState] = useState(null);
  const [blob, setBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Tekan dan tahan untuk mulai merekam");
  const [bg, setBg] = useState("primary");
  const [prediction, setPrediction] = useState([]);

  const server = process.env.REACT_APP_SERVER;

  // refs section
  const placeholderRef = useRef(null);
  const micRef = useRef(null);
  const AudioReactRecorderRef = useRef(null);

  // handlers section
  const startRecording = () => {
    setRecordState(RecordState.START);
    setIsRecording(true);
    // reset all
    setBlob(null);
    setResponse(null);
    setPrediction([]);
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
    submit();
  };

  const handleStopRecording = (audioData) => {
    setBlob(audioData.blob);
    micRef.current.style.color = "var(--bs-light)";
    AudioReactRecorderRef.current.style.display = "none";
  };

  const submit = async () => {
    setStatus("Membuat annotasi");
    setBg("warning");

    // convert blob to file object
    const file = new File([blob], "audio.wav", {
      type: "audio/wav",
    });

    const formData = new FormData();
    formData.append("file", file);

    // send file to server
    axios
      .post(server + "/api/v1/predict/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          enctype: "multipart/form-data",
        },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setStatus("Mendownload annotasi " + percentCompleted + "%");
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setStatus("Membuat annotasi " + percentCompleted + "%");
          if (percentCompleted === 100) {
            setStatus("Mendownload annotasi");
          }
        },
      })
      .then((res) => {
        console.log(res.data.data);
        setStatus("Selesai");
        setBg("success");
      })
      .catch((err) => {
        console.log(err);
        setStatus(err.message);
        setBg("danger");
      });
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

      <div>{JSON.stringify(prediction)}</div>
    </div>
  );
}

export default App;
