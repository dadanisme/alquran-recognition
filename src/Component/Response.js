import { useState, useEffect } from "react";
import Prediction from "./Prediction";

export default function Response(props) {
  const [response, setResponse] = useState(null);
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResponse(props.response);
    setLoading(props.loading);
    setPrediction(props.prediction);
  }, [props.response, props.prediction, props.loading]);
  return (
    <div>
      {response !== null && prediction.length > 0 ? (
        <div>
          {response.result.map((annotation, index) => {
            return (
              <ul key={index}>
                <li>
                  transcipt:{" "}
                  <span dir="rtl" lang="ar">
                    {annotation.transcript}
                  </span>
                </li>
                <li>translated: {annotation.translated}</li>
                <li>confidence: {(annotation.confidence * 100).toFixed(2)}%</li>
                {prediction.map((preds, idxs) => {
                  return (
                    <Prediction key={idxs} idx={index} prediction={preds} />
                  );
                })}
              </ul>
            );
          })}
        </div>
      ) : (
        <div>{loading ? "Loading..." : "No response"}</div>
      )}
    </div>
  );
}
