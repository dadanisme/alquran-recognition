import { useState, useRef, useEffect } from "react";
import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import "./App.css";
import Response from "./Component/Response";

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
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [sampleRateHertz, setSampleRateHertz] = useState(null);
  const [prediction, setPrediction] = useState([]);

  const server = "http://127.0.0.1:5000/";

  // refs section
  const uploadRef = useRef(null);
  const getResponseRef = useRef(null);
  const predictRef = useRef(null);

  // effects section
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSampleRateHertz(48000);
    } else {
      setSampleRateHertz(44100);
    }
  }, []);

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
    setStatus("Recording...");
  };

  const stopRecording = () => {
    setRecordState(RecordState.STOP);
    setIsRecording(false);
  };

  const handleStopRecording = (audioData) => {
    console.log(audioData);
    setBlob(audioData);
    setIsRecorded(true);
  };

  const handleUploadBlob = () => {
    setStatus("Uploading...");
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
          setStatus("Uploaded");
        }
      };
    }
  };

  const handleSubmit = async () => {
    setStatus("Submitting...");
    console.log(filename);
    setLoading(true);
    if (filename) {
      console.log("submitting");
      const xhr = new XMLHttpRequest();
      const url = `${server}/get_response?filename=${filename}&sample_rate_hertz=${sampleRateHertz}`;
      xhr.open("GET", url, true);
      xhr.send();
      xhr.onreadystatechange = async function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const data = await JSON.parse(xhr.responseText);
          console.log(data);
          setResponse(data);
          setLoading(false);
          setStatus("Success");
          setIsSubmitted(true);
        }
      };
    }
  };

  const handlePredict = async () => {
    setStatus("Predicting...");
    setLoading(true);
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
            console.log(data);
            setLoading(false);
            setStatus("Success");
            setPrediction((prev) => [...prev, data]);
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
    >
      {/* Recorder section */}
      <div
        onClick={isRecording ? stopRecording : startRecording}
        className="recorder"
      >
        <AudioReactRecorder
          backgroundColor="white"
          foregroundColor="red"
          state={recordState}
          canvasWidth="200px"
          canvasHeight="200px"
          onStop={handleStopRecording}
        />
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

      {/* Status section */}
      <div>Status: {status ? status : "Idle"}</div>

      {/* Response section */}
      <Response response={response} prediction={prediction} loading={loading} />
    </div>
  );
}

export default App;
