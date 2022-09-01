import { createSignal } from 'solid-js';

function Counter() {
  const [ count, setCount ] = createSignal(0);

  const increment = () => {
    setCount((cur) => (cur + 1));
  };

  return <div>
    <span>Current count: { count() }</span>
    <button onClick={increment}>+</button>
  </div>
}
export default Counter;
