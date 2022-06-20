import { useState, useEffect } from "react";
import Prediction from "./Prediction";
import { Card } from "react-bootstrap";

export default function Response(props) {
  const [response, setResponse] = useState(null);
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResponse(props.response);
    setLoading(props.loading);
    setPrediction(props.prediction);
    console.log(props.prediction);
  }, [props.response, props.prediction, props.loading]);

  if (loading) {
    return <div></div>;
  }
  if (response !== null) {
    return (
      <div className="response">
        <h3
          className="mt-2"
          style={{
            textAlign: "center",
            color: "var(--bs-light)",
          }}
        >
          Hasil Annotasi
        </h3>
        {response.result.map((annotation, idx) => {
          return (
            <div key={idx}>
              <div className="annotation">
                <Card className="response-item">
                  <Card.Header className="response-header">
                    <span dir="rtl" lang="ar">
                      {annotation.transcript}
                    </span>
                  </Card.Header>
                  <Card.Body>
                    <div>{annotation.translated}</div>
                    <div>{(annotation.confidence * 100).toFixed(2)}%</div>
                  </Card.Body>
                </Card>
              </div>
              {prediction[idx] && (
                <Prediction idx={idx} prediction={prediction[idx]} />
              )}
              {idx < response.result.length - 1 && <hr />}
            </div>
          );
        })}
      </div>
    );
  }
}
