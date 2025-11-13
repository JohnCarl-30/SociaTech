export default function Input({type,name,placeholder, className}){
    return(<>
        <input type={type} name={name} placeholder={placeholder} required className={className}/>
    </>)
}