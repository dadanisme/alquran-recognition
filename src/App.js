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
  const [filename, setFilename] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState(null);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPredicted, setIsPredicted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Tekan dan tahan untuk mulai merekam");
  const [bg, setBg] = useState("primary");
  const [prediction, setPrediction] = useState([]);

  const server = process.env.REACT_APP_SERVER;

  // refs section
  const uploadRef = useRef(null);
  const getResponseRef = useRef(null);
  const predictRef = useRef(null);
  const placeholderRef = useRef(null);
  const micRef = useRef(null);
  const AudioReactRecorderRef = useRef(null);

  // effects section
  useEffect(() => {
    if (isRecorded) {
      uploadRef.current.click();
    }
  }, [isRecorded]);

  useEffect(() => {
    if (isUploaded) {
      getResponseRef.current.click();
    }
  }, [isUploaded]);

  useEffect(() => {
    if (isSubmitted) {
      predictRef.current.click();
    }
  }, [isSubmitted]);

  // handlers section
  const startRecording = () => {
    setRecordState(RecordState.START);
    setIsRecording(true);
    // reset all
    setBlob(null);
    setResponse(null);
    setFilename(null);
    setPrediction([]);
    setIsRecorded(false);
    setIsUploaded(false);
    setIsSubmitted(false);
    setIsPredicted(false);
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
    console.log(audioData);
    setBlob(audioData);
    setIsRecorded(true);
    micRef.current.style.color = "var(--bs-light)";
    AudioReactRecorderRef.current.style.display = "none";
  };

  const handleUploadBlob = () => {
    setStatus("Mengupload...");
    setBg("warning");
    setLoading(true);
    if (blob) {
      const xhr = new XMLHttpRequest();
      const filename = blob.url.split("/")[blob.url.split("/").length - 1];
      const url = `${server}/upload_blob?filename=${filename}`;
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "audio/wav");
      xhr.send(blob.blob);
      xhr.onreadystatechange = async function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const data = await JSON.parse(xhr.responseText);
          console.log(data);
          setFilename(data.filename);
          setIsUploaded(true);
          setStatus("Berhasil mengupload");
          setBg("success");
        } else {
          setStatus("Error");
          setBg("danger");
        }
      };
    }
  };

  const handleSubmit = async () => {
    setStatus("Membuat annotasi");
    setBg("warning");
    console.log(filename);
    if (filename) {
      console.log("submitting");
      const xhr = new XMLHttpRequest();
      const url = `${server}/get_response?filename=${filename}`;
      xhr.open("GET", url, true);
      xhr.send();
      xhr.onreadystatechange = async function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const data = await JSON.parse(xhr.responseText);
          console.log(data);
          setResponse(data);
          setStatus("Berhasil membuat annotasi");
          setBg("success");
          setIsSubmitted(true);
        } else {
          setStatus("Error");
          setBg("danger");
        }
      };
    }
  };

  const handlePredict = async () => {
    setStatus("Memprediksi ayat");
    setBg("warning");
    if (response) {
      response.result.forEach((annotation) => {
        const text = annotation.translated;
        console.log("predicting: " + text);
        const xhr = new XMLHttpRequest();
        const url = `${server}/predict?text=${text}`;
        xhr.open("GET", url, true);
        xhr.send();
        xhr.onreadystatechange = async function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const data = await JSON.parse(xhr.responseText);
            setLoading(false);
            setStatus("Berhasil memprediksi");
            setBg("success");
            console.log(data);
            setIsPredicted(true);
            setPrediction((prev) => [data, ...prev]);
          } else {
            setStatus("Error");
            setBg("danger");
          }
        };
      });
    }
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
          response !== null && isPredicted
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
        <Button ref={uploadRef} onClick={handleUploadBlob} hidden>
          Upload
        </Button>
        <Button ref={getResponseRef} onClick={handleSubmit} hidden>
          Get Annotation
        </Button>
        <Button ref={predictRef} onClick={handlePredict} hidden>
          Predict
        </Button>
      </div>

      {/* Response section */}
      {response !== null && isPredicted && (
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
