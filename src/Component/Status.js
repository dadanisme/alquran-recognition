import { useState, useEffect } from "react";
import { Badge } from "react-bootstrap";

export default function Status(props) {
  const [status, setStatus] = useState("");
  const [bg, setBg] = useState("");

  useEffect(() => {
    setStatus(props.status);
  }, [props.status]);

  useEffect(() => {
    setBg(props.bg);
  }, [props.bg]);

  return (
    <Badge className="mt-2 mb-2 fst-italic" bg={bg}>
      {status ? status : "Idle"}
    </Badge>
  );
}
