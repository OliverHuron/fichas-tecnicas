export default function SiNo({ value }) {
  return (
    <span>
      SI ( {value ? 'X' : ' '} ) &nbsp;&nbsp; NO ( {value ? ' ' : 'X'} )
    </span>
  );
}
