import React, { useState, useEffect } from 'react';
import "./App.css"

function App() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [koalaPrompt, setKoalaPrompt] = useState(""); // Corrected typo: usestate -> useState
  const [showArticleDetails, setShowArticleDetails] = useState(false);
  const [gptOption, setGptOption] = useState([
    'gpt-4'
  ]);
  const [finalGptOption, setFinalGptOption] = useState("gpt-3.5");

  const [articleLength, setArticleLength] = useState(['custom', 'short', 'shorter', 'medium', 'long', 'longer']);
  const [finalArticleLength, setFinalArticleLength] = useState("default");

  const [numberOfSections, setNumberOfSections] = useState([
    2, 3, 4, 5, 6, 7, 8, 9, 10
  ]);
  const [finalNumberOfSections, setFinalNumberOfSections] = useState("1")

  const [realTimeData, setRealTimeData] = useState(["true"]);
  const [finalrealTimeData, setFinalRealTimeData] = useState("false")

  const [shouldCiteSources, setShouldCiteSources] = useState([
    "false"
  ]);
  const [finalShouldCiteSources, setFinalShouldCiteSources] = useState("true")

  const [multimediaOption, setMultimediaOption] = useState([
    "auto", "images", "videos"
  ]);
  const [finalMultimediaOption, setFinalMultimediaOption] = useState("none")

  const [imageStyle, setImageStyle] = useState([
    "photo", "fantasy", "anime", "isometric"
  ]);
  const [finalImageStyle, setFinalImageStyle] = useState("illustration")

  const [maxImages, setMaxImages] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  ]);
  const [finalMaxImages, setFinalMaxImages] = useState("1");

  const [imageSize, setImageSize] = useState([
    "1152x896", "1216x832", "1344x768", "1536x640", "640x1536", "768x1344", "832x1216","896x1152"
  ]);
  const [finalImageSize, setFinalImageSize] = useState("1024x1024");

  const [maxVideos, setMaxVideos] = useState([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  ]);
  const [finalMaxVideos, setFinalMaxVideos] = useState();

  const handleAiBlogGenerator = async () => {
    try {
      const response = await fetch('http://18.216.130.153:5010/proxy-koala-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetKeyword: koalaPrompt,
          gptVersion: finalGptOption,
          integrationId: "48cf3ab3-b842-412c-8ddd-a1a5e8021812",
          articleLength: finalArticleLength,
          numberOfSections: finalNumberOfSections,
          realTimeData: finalrealTimeData,
          shouldCiteSources: finalShouldCiteSources,
          multimediaOption: finalMultimediaOption,
          imageStyle: finalImageStyle,
          maxImages: finalMaxImages,
          imageSize: finalImageSize,
          maxVideos: finalMaxVideos,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to proxy Koala.ai request');
      }

      const data = await response.json();
      console.log('Koala.ai Response:', data);

      const articleId = data.articleId;
      console.log(articleId)
      setKoalaPrompt(articleId);
      setShowArticleDetails(true);

    } catch (error) {
      console.error('Error proxying Koala.ai request:', error.message);
    }
  };
  function ArticleDetails({ targetKeyword }) {
    const [articleDetails, setArticleDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [element,setElement] = useState(<p>loading...</p>);

    // const fetchArticleDetails = async () => {
    //   try {
    //     const response = await axios.get(`http://localhost:5010/get-koala-article/${targetKeyword}`)
    //     console.log("response.data:",response.data);
    //     setArticleDetails(response.data);
    //     if(response?.data?.output){
    //       setElement(parse(response.data.output || <div></div>))
    //       console.log("element:",element);
    //     }
    //     console.log(response)
    //   } catch (error) {
    //     setError(error.message || 'An error occurred while fetching article details.');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    useEffect(() => {
      if (koalaPrompt.length) {
        makeInitialApiRequest();

      }
    }, [koalaPrompt])
    const [processingStatus, setProcessingStatus] = useState('processing');

    const [progress, setProgress] = useState(0);
  
    // Simulate making the initial API request
    const makeInitialApiRequest = async () => {
      try {
        const response = await fetch(`http://18.216.130.153:5010/get-koala-article/${targetKeyword}`);
        const result = await response.json();

        if (result.status === 'finished') {
          // Handle the case where the status is already finished
          setProcessingStatus('finished');
          setProgress(100);
          if(result?.output){
            setElement(<div dangerouslySetInnerHTML={{ __html: result.output.html }} />);
            console.log("element:",element);
          }
        }
        else if (result.status === 'processing') {
          // Set processing status and progress based on the initial response
          setProcessingStatus('processing');
          setProgress(result.progress);
  
          // Start polling for updates
          pollApiForUpdates();
        } else {
          // Handle unexpected response
          console.error('Unexpected initial response:', result);
        }
      } catch (error) {
        // Handle errors
        console.error('Error during initial API request:', error);
      }
    };
  
    // Simulate making the API request to check for updates
    const pollApiForUpdates = async () => {
      const pollingInterval = 2000; // 2 seconds
  
      const pollingIntervalId = setInterval(async () => {
        try {
          const response = await fetch(`http://18.216.130.153:5010/get-koala-article/${targetKeyword}`);
          const result = await response.json();
  
          if (result.status === 'finished') {
            // Handle the final success response
            // console.log(result);
            setProcessingStatus('finished');
            setProgress(100);
            if(result?.output){
              setElement(<div dangerouslySetInnerHTML={{ __html: result.output.html }} />);
              // console.log("element:",element);
            }

            clearInterval(pollingIntervalId); // Stop polling

          } else if (result.status === 'processing') {
            // Handle intermediate responses
            setProgress(result.progress);
            setElement(<p>`loading...{result.progress}%`</p>)
            // pollApiForUpdates();
          } else {
            // Handle unexpected response
            console.error('Unexpected response during polling:', result);
            clearInterval(pollingIntervalId); // Stop polling
          }
        } catch (error) {
          // Handle errors
          console.error('Error during polling:', error);
          clearInterval(pollingIntervalId); // Stop polling
        }
      }, pollingInterval);
    };
    return (
      <div>
        <h2>Article Details</h2>
        <div>
          {element}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Koala Blog</h1>
      <textarea
        name="prompt"
        value={koalaPrompt}
        onChange={(e) => setKoalaPrompt(e.target.value)}
      ></textarea>

      <label>Enter Gpt version: </label>
      <select
        name="gpt"
        id="gptOption"
        value={finalGptOption}
        onChange={(e) => setFinalGptOption(e.target.value)}
      >
        <option value="gpt-3.5">gpt-3.5</option>
        {gptOption.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>

      <label>Article Length: </label>
      <select
        name="ArticleLength"
        id="Articlelength"
        value={finalArticleLength}
        onChange={(e) => setFinalArticleLength(e.target.value)}
      >
        <option value="default">default</option>
        {articleLength.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
      {finalArticleLength==='custom' &&
      <> 
      <label>No Of Sections: </label>
      <select
        name="Sections"
        id="noOfSections"
        value={finalNumberOfSections}
        onChange={(e) => setFinalNumberOfSections(e.target.value)}
      >
        <option value="1">1</option>
        {numberOfSections.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))
        }
      </select>
      </>}

      <label>Real Time Data: </label>
      <select
        name="realtimedata"
        id="realTimeData"
        value={finalrealTimeData}
        onChange={(e) => setFinalRealTimeData(e.target.value)}
      >
        <option value="false">false</option>
        {realTimeData.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>

      <label>Should Cite Sources: </label>
      <select
        name="citeSources"
        id="citeSources"
        value={finalShouldCiteSources}
        onChange={(e) => setFinalShouldCiteSources(e.target.value)}
      >
        <option value="true">true</option>
        {shouldCiteSources.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>


      <label>MultiMedia: </label>
      <select
        name="multimedia"
        id="multimedia"
        value={finalMultimediaOption}
        onChange={(e) => setFinalMultimediaOption(e.target.value)}
      >
        <option value="none">none</option>
        {multimediaOption.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>

      {finalMultimediaOption === 'images' && (
        <>
          <label>Image Style: </label>
          <select
            name="imagestyle"
            id="imagestyle"
            value={finalImageStyle}
            onChange={(e) => setFinalImageStyle(e.target.value)}
          >
            <option value="illustration">illustration</option>
            {imageStyle.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>

          <label>No Of Images: </label>
          <select
            name="noOfImages"
            id="noOfImages"
            value={finalMaxImages}
            onChange={(e) => setFinalMaxImages(e.target.value)}
          >
            <option value="0">0</option>
            {maxImages.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>

          <label>Image Size: </label>
          <select
            name="imageSize"
            id="imageSize"
            value={finalImageSize}
            onChange={(e) => setFinalImageSize(e.target.value)}
          >
            <option value="1024x1024">1024x1024</option>
            {imageSize.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </>
      )}


      {finalMultimediaOption === 'videos' && (
        <>
          <label>No Of Videos: </label>
          <select
            name="noOfVideos"
            id="noOfVideos"
            value={finalMaxVideos}
            onChange={(e) => setFinalMaxVideos(e.target.value)}
          >
            <option value="0">0</option>
            {maxVideos.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </>
      )}
      {finalMultimediaOption === 'auto' && (
        <>
          <label>Image Style: </label>
          <select
            name="imagestyle"
            id="imagestyle"
            value={finalImageStyle}
            onChange={(e) => setFinalImageStyle(e.target.value)}
          >
            <option value="illustration">illustration</option>
            {imageStyle.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>

          <label>No Of Images: </label>
          <select
            name="noOfImages"
            id="noOfImages"
            value={finalMaxImages}
            onChange={(e) => setFinalMaxImages(e.target.value)}
          >
            <option value="0">0</option>
            {maxImages.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>

          <label>Image Size: </label>
          <select
            name="imageSize"
            id="imageSize"
            value={finalImageSize}
            onChange={(e) => setFinalImageSize(e.target.value)}
          >
            <option value="1024x1024">1024x1024</option>
            {imageSize.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>

          <label>No Of Videos: </label>
          <select
            name="noOfVideos"
            id="noOfVideos"
            value={finalMaxVideos}
            onChange={(e) => setFinalMaxVideos(e.target.value)}
          >
            <option value="0">0</option>
            {maxVideos.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </>
      )}

      <button onClick={handleAiBlogGenerator}>Submit</button>
      {showArticleDetails && <ArticleDetails targetKeyword={koalaPrompt} />}
      <ul>
        {blogPosts.map(post => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
