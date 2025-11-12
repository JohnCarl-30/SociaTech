export default function Button({btnName,type,onClick,className}){
    return(<>
        <button
        type={type}
        onClick={onClick}
        className={className}
        >
        {btnName}
        </button>
    </>)
}