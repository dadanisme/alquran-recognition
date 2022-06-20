import { useState, useEffect } from "react";
import { Card } from "react-bootstrap";

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
      <div>
        <h3
          className="mt-2"
          style={{
            textAlign: "center",
            color: "var(--bs-light)",
          }}
        >
          Ayat Al-Qur'an yang cocok
        </h3>
        <div key={idx} className="prediction-container">
          {prediction.result.map((pred, idx) => {
            return (
              <div key={idx}>
                <Card className="prediction-item">
                  <Card.Header className="prediction-header">
                    {pred.identifier}
                  </Card.Header>
                  <Card.Body className="prediction-body">
                    <Card.Text>
                      <span dir="rtl" lang="ar">
                        {pred.ar}
                      </span>
                    </Card.Text>
                    <Card.Text>{pred.idn}</Card.Text>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    return <div key={idx}>No result found</div>;
  }
}
