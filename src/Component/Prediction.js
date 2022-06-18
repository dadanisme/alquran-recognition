import { useState, useEffect } from "react";

export default function Prediction(props) {
  const [idx, setIdx] = useState(null);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    setIdx(props.idx);
    setPrediction(props.prediction);
    console.log(props.prediction);
  }, [props.idx, props.prediction]);

  if (idx !== null && prediction !== null) {
    return (
      <div key={idx}>
        {prediction.result.map((pred, idx) => {
          return (
            <ul key={idx} className="mb-3">
              <li>Identifier: {pred.identifier}</li>
              <li>
                Arabic:{" "}
                <span dir="rtl" lang="ar">
                  {pred.ar}
                </span>
              </li>
              <li>Translated: {pred.idn}</li>
            </ul>
          );
        })}
      </div>
    );
  } else {
    return <div key={idx}>No result found</div>;
  }
}
