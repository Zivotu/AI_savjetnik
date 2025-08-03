import { useEffect, useState } from "react";

interface TypeWriterProps {
  text: string;
}

const TypeWriter: React.FC<TypeWriterProps> = ({ text }) => {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setShown(text.slice(0, ++i));
      if (i >= text.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [text]);

  return <span>{shown}</span>;
};

export default TypeWriter;
