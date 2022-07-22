import './App.css';
import React, {useEffect, useState} from "react";
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from "react-chartjs-2";
import { ReactComponent as DeleteIcon } from './delete.svg';
import ReactSelect from 'react-select';
import {JEWISH_MEM} from "./datasets/jmen";
import {JEWISH_WOMEN} from "./datasets/jwomen";
import { MMEN } from "./datasets/mmen";
import {M_WOMEN} from "./datasets/mwomen";
import AsyncSelect from "react-select/async";

ChartJS.register(...registerables);

const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx)

const getRandomDatasheet = () => {
  const index = Math.floor(Math.random()*selectOptions.length);
  return selectOptions[index];
}

const getRandombckColor = () => {
  return `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`
}

const selectOptions = [
  {
    label: 'יהודים',
    value: 1,
    dataset: JEWISH_MEM,
  },
  {
    label: 'יהודיות',
    value: 2,
    dataset: JEWISH_WOMEN,
  },
  {
    label: 'מוסלמים',
    value: 3,
    dataset: MMEN,
  },
  {
    label: 'מוסלמיות',
    value: 4,
    dataset: M_WOMEN,
  },

]
const parseYearValue = yearValue => {
  if (yearValue.includes(',')) {
    const value = yearValue.replaceAll(',', '');
    return parseInt(value);
  }
  if (yearValue === ".") return 0;
  if(yearValue === "..") return Math.floor(Math.random() * 4);
  return parseInt(yearValue);
}

const labels = range(1948, 2021);

const createDataFromRow = row => {
  const y = labels.map(year => parseYearValue(row[year]));
  return ({
    y,
    name: row.name,
    total: row.total,
  });
}

function App() {
  const [datasets, setDatasets] = useState([]);
  const randomDatasheet = getRandomDatasheet();
  const [datasheet, setDatasheet] = useState(randomDatasheet);
  const [selectedName, setSelectedName] = useState({});

  const [defaultOptions, setDefOptions] = useState([]);

  const addDataSet = () => {
    debugger
    if (selectedName.label) {
      const newDataset = createDataFromRow(datasheet.dataset.find(item => item.name === selectedName.label))
      const color = getRandombckColor();
      setDatasets(prev => [
        ...prev, {
          label: newDataset.name,
          data: newDataset.y,
          borderColor: color,
          backgroundColor: color,
        }
      ]);
    }
  }
  useEffect(() => {
    document.title = 'שמות בישראל';
  }, []);

  const onLoadOptions = searchQuery => {
    if (searchQuery) {
      const names = datasheet.dataset.map(item => item.name);
      const matching = names.filter(name => name.startsWith(searchQuery)).slice(0, 10).map((item, i) => ({
        label: item,
        value: i,
      }));
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(matching)
        }, 100);
      })
    }
    return Promise.reject();
  };

  useEffect(() => {
     const createDefaultOptions = () => {
      return datasheet.dataset.slice(0,10).map((item, index) => ({
        label: item.name,
        value: index,
      }));
    }
    const defaultOptions = createDefaultOptions();
    setDefOptions(defaultOptions);
    setSelectedName(defaultOptions[Math.floor(Math.random() * 9)])
    // eslint-disable-next-line
  }, [datasheet]);

  // eslint-disable-next-line
  useEffect(addDataSet, [selectedName]);
  return (
    <div className="main-view">
      <div className="plot-and-search">
        <div className="search-input">
          <div title="נקה את הרשימה" className="clear-icon" onClick={() => setDatasets([])}>
            <DeleteIcon />
          </div>
          <AsyncSelect
          defaultOptions={defaultOptions}
          value={selectedName}
          loadOptions={onLoadOptions}
          onChange={setSelectedName}
          className="name-select"
          isRtl
        />
          <ReactSelect
          options={selectOptions}
          value={datasheet}
          onChange={setDatasheet}
          isRtl
          className="data-select"
        />
      </div>
      <div className="plot-wrapper">
        <Line
          className="plot"
          datasetIdKey='id'
          data={{
            labels,
            datasets,
          }}
        />
      </div>
      </div>
    </div>
  );
}

export default App;
