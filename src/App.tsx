import { useState, useCallback, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import "./App.css";

function App() {
  const [content, setContent] = useState<number | string>("");
  const [currentSource, setCurrentSource] = useState<any>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [couldClick, setCouldClick] = useState(true);
  const [mirrorHeight, setMirrorHeight] = useState(0);
  const currentContent = useRef("");
  const mirrorContent: any = useRef("");
  const mirrorScroll: any = useRef("");
  const changeVal = (val: any) => {
    const curVal = val.target.value;
    setContent(curVal);
  };
  const handleMessage = (e: any) => {
    if (JSON.parse(e.data).choices?.[0]?.finish_reason) setCouldClick(true);
    currentContent.current =
      currentContent.current + JSON.parse(e.data).choices?.[0]?.delta?.content;
    // setPreviewContent(
    //   `${previewContent + JSON.parse(e.data).choices?.[0]?.delta?.content}`
    // );
    setPreviewContent(currentContent.current);
    setTimeout(() => {
      // console.log(mirrorScroll.current);
      // console.log(mirrorContent.current);
      // document.getElementsByClassName('cm-content')[0].clientHeight
      // document.getElementsByClassName('cm-scroller')[0].scrollTo(0,20000000)
      mirrorScroll.current.scrollTo(0, mirrorContent.current.clientHeight || 0);
    });
  };

  const pendingAnswer = useCallback(() => {
    if (!couldClick) return;
    setCouldClick(false);
    // currentSource && currentSource
    setPreviewContent("");
    currentContent.current = "";
    let source = new EventSource(
      `http://localhost:1919/getAIInfo?msg=${content}`
    );
    source.addEventListener(
      "open",
      function () {
        console.log("建立连接。。。");
      },
      false
    );
    source.addEventListener(
      "error",
      function (e: any) {
        if (e.readyState === EventSource.CLOSED) {
          console.log("连接关闭");
        } else {
          console.log(e);
        }
      },
      false
    );
    source.addEventListener("message", handleMessage);
    mirrorContent.current = document.getElementsByClassName("cm-content")[0];
    mirrorScroll.current = document.getElementsByClassName("cm-scroller")[0];
    setCurrentSource(source);
  }, [previewContent, content, currentSource, couldClick]);
  useEffect(() => {
    setMirrorHeight(
      document.getElementsByClassName("preview")[0].clientHeight - 40 || 0
    );
    console.log(document.getElementsByClassName("preview")[0].clientHeight);
  }, []);
  return (
    <>
      <div className="App-content">
        <div className="header">阿里云-通义千问：</div>
        <div className="input">
          <input
            onChange={changeVal}
            placeholder="例如：请给我讲个故事"
            value={content}
          />
          <button disabled={!couldClick} onClick={pendingAnswer}>
            提问
          </button>
        </div>
        <div
          className="preview"
          // dangerouslySetInnerHTML={{ __html: previewContent }}
        >
          {mirrorHeight && (
            <CodeMirror
              readOnly
              value={previewContent}
              height={`${mirrorHeight}px`}
              extensions={[java(), javascript({ jsx: true })]}
              theme={oneDark}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
