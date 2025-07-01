import { useState } from 'react'
import Papa from "papaparse"
import './App.css'

const allowedExtensions = ["csv"];

type mmType = {
  event_number: string
  event: string
  heats: string
  splits: number
  round: string

}


function App() {
  const [mmData, setMMData] = useState<mmType[]>([])

  // It state will contain the error when
    // correct file extension is not used
    const [error, setError] = useState("");

    // It will store the file uploaded by the user
    const [file, setFile] = useState<File>();

    // This function will be called when
    // the file input changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError("");

        // Check if user has entered the file
        if (e?.target.files?.length) {
            const inputFile = e.target.files[0];

            // Check the file extensions, if it not
            // included in the allowed extensions
            // we show the error
            const fileExtension =
                inputFile?.type.split("/")[1];
            if (
                !allowedExtensions.includes(fileExtension)
            ) {
                setError("Please input a csv file");
                return;
            }

            // If input type is correct set the state
            setFile(inputFile);
            
        }
    };

    const handleParse = () => {
    
       if (!file) return alert("Enter a valid file");
      console.log('handling parse')
    const reader = new FileReader();

    reader.onload = async (event) => {
        const text = (event.target?.result || "") as string;

        const csv = Papa.parse<string[]>(text, {
            header: false,
            skipEmptyLines: true,
        });

        if (csv.errors.length) {
            setError("Error parsing CSV");
            return;
        }
        console.log(csv)
        // Assuming each row is a single column like: "Event Name"
        const parsedData = csv.data.map((row) => {
            return { event_number: `${row[18]}${row[19]}`, event: row[20], heats: row[21], splits:1, round: 'F' };
        });

        setMMData(parsedData);
    };

    reader.readAsText(file);

  }

  const handleDownload = () => {
    const csvData = Papa.unparse(mmData, {
	quotes: false, //or array of booleans
	quoteChar: '"',
	escapeChar: '"',
	delimiter: ",",
	header: false,
	newline: "\r\n",
	skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
})

const element = document.createElement("a");
    const file = new Blob([csvData], {
      type: "text/plain"
    });
    element.href = URL.createObjectURL(file);
    element.download = "dolphin.csv";
    document.body.appendChild(element);
    element.click();

  }

  return (
     <div className="App">
            <h1>Convert Meet Manager to Dolphin Format</h1>
            <div className="container">
                <label
                    htmlFor="csvInput"
                    style={{ display: "block" }}
                >
                    Enter CSV File
                </label>
                <input
                    onChange={handleFileChange}
                    id="csvInput"
                    name="file"
                    type="File"
                    style={{margin: '10px'}}
                />
                <div>
                    <button onClick={handleParse} style={{margin: '10px'}}>
                        Parse
                    </button>
                </div>
                <div>
                  {mmData.length>0 && <button onClick={handleDownload}> Download </button>}
                </div>
                <div style={{ marginTop: "3rem" }}>
                    {error
                        ? error
                        : mmData.map((e) => (
                              <div key={e.event_number} className="item">
                                  {`Event Number: ${e.event_number}
                                  Event: ${e.event}
                                  Heats: ${e.heats}`}
                              </div>
                          ))}
                </div>
            </div>
        </div>
  )
}

export default App