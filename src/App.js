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
import {CMEN} from "./datasets/cmen";
import {CWOMEN} from "./datasets/cwomen";
import {DMEN} from "./datasets/dmen";
import {DWOMEN} from "./datasets/dwomen";
import {OTHERS} from "./datasets/other";
import {FOTHERS} from "./datasets/fml-others";

ChartJS.register(...registerables);

const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx)

const getRandomDatasheet = () => {
  const index = Math.floor(Math.random()*selectOptions.length);
  return selectOptions[index];
}

const getRandombckColor = () => {
  return `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`
}

const parseYearValue = yearValue => {
  if (yearValue === ".") return 0;
  if(yearValue === "..") return Math.floor(Math.random() * 4);
  return parseInt(yearValue?.replaceAll(',', ''));
}

const getNormalizeValueByYear = (dataset, year) => {
  const values = dataset.map(item => parseYearValue(item[year]));
  return values.reduce((a, b) => a + b, 0);
}
const createNormValues = dataset => {
  const yearsList = range(1948, 2021);
  const normValues = {};
  yearsList.forEach(year => {
    normValues[year] = getNormalizeValueByYear(dataset, year);
  })
  return normValues;
}
let sortValue = 1;
const selectOptions = [
  {
    label: 'יהודים',
    value: sortValue += 1,
    dataset: JEWISH_MEM,
    normValues: createNormValues(JEWISH_MEM),
  },
  {
    label: 'יהודיות',
    value: sortValue += 1,
    dataset: JEWISH_WOMEN,
    normValues: createNormValues(JEWISH_WOMEN),
  },
  {
    label: 'מוסלמים',
    value: sortValue += 1,
    dataset: MMEN,
    normValues: createNormValues(MMEN),
  },
  {
    label: 'מוסלמיות',
    value: sortValue += 1,
    dataset: M_WOMEN,
    normValues: createNormValues(M_WOMEN),
  },
  {
    label: 'נוצרים',
    value: sortValue += 1,
    dataset: CMEN,
    normValues: createNormValues(CMEN),
  },
  {
    label: 'נוצריות',
    value: sortValue += 1,
    dataset: CWOMEN,
    normValues: createNormValues(CWOMEN),
  },
  {
    label: 'דרוזים',
    value: sortValue += 1,
    dataset: DMEN,
    normValues: createNormValues(DMEN),
  },
  {
    label: 'דרוזיות',
    value: sortValue += 1,
    dataset: DWOMEN,
    normValues: createNormValues(DWOMEN),
  },
  {
    label: 'אחרים',
    value: sortValue += 1,
    dataset: OTHERS,
    normValues: createNormValues(OTHERS),
  },
  {
    label: 'אחרות',
    value: sortValue += 1,
    dataset: FOTHERS,
    normValues: createNormValues(FOTHERS),
  },
]


const labels = range(1948, 2021);

const createDataFromRow = (datasheet, selectedName) => {
  const row = datasheet.dataset?.find(item => item.name === selectedName.label);
  const y = labels.map(year => parseYearValue(row[year]));
  const normalized = labels.map(year => {
    const yearTotal = datasheet.normValues[year];
    if (yearTotal) {
      const yearValue = parseYearValue(row[year]);
      return 100*(yearValue/yearTotal);
    }
    return 0;
  });

  return ({
    y,
    name: row.name,
    total: row.total,
    normalized,
  });
}

function App() {
  const [datasets, setDatasets] = useState([]);
  const randomDatasheet = getRandomDatasheet();
  const [datasheet, setDatasheet] = useState(randomDatasheet);
  const [selectedName, setSelectedName] = useState({});
  const [defaultOptions, setDefOptions] = useState([]);
  const [shouldUseNorm, setShouldUseNorm] = useState(false);

  const addDataSet = () => {
    if (selectedName.label) {
      const newDataset = createDataFromRow(datasheet, selectedName);
      const color = getRandombckColor();
      setDatasets(prev => [
        ...prev, {
          label: newDataset.name,
          data: shouldUseNorm ? newDataset.normalized : newDataset.y,
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

  const onCheckboxChange = e => {
    setShouldUseNorm(e.target.checked);
    setDatasets([]);
  }
  return (
    <div className="main-view">
      <div className="plot-wrapper">
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
        <div className="toggle-wrapper">
          <input
            type="checkbox"
            value={shouldUseNorm}
            onChange={onCheckboxChange}
          />
          <span> נרמל </span>
        </div>
      </div>
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
