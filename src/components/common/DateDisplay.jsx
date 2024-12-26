import { parseAndFormatDate } from '/src/utils/utils.js';

export default function DateDisplay({currentRecordIndex, setCurrentRecordIndex, totalLength, date}) {
    const previousIndex = currentRecordIndex - 1 > 0? currentRecordIndex - 1: 0;
    const nextIndex = currentRecordIndex + 1 >= totalLength? currentRecordIndex: currentRecordIndex + 1;
    console.log(nextIndex, totalLength, currentRecordIndex)
    return(
        <div className="d-flex top-row text-white custom-row justify-content-start" style={{background: `linear-gradient(45deg, rgb(0, 0, 0), rgb(73 21 132 / 0%))`, padding: '12px 24px', boxShadow: '0 0 4px rgb(73 21 132 / 50%))'}}>
            {
                previousIndex ?
                    <span onClick={() => setCurrentRecordIndex(previousIndex)}><img width={24} src="/src/assets/arrow-left.svg" alt="left arrow" /></span>
                    : null
                
            }
            <div className="mx-3" style={{width: 'max-content'}}>
               <strong> Viewing data of {parseAndFormatDate(date || '')}</strong>
            </div>
            {
                !(nextIndex == currentRecordIndex) ?
                    <span className={'disabled'} onClick={() => setCurrentRecordIndex(nextIndex)}><img width={24} src="/src/assets/arrow-right.svg" alt="right arrow" /></span>
                    : null
            }
        </div>
    );
}