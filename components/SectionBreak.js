function SectionBreak(props) {

    const {sectionName} = props;

    return (
        <span className="flex text-center mx-auto py-5 pb-8" >
            <p>{sectionName}</p>
        </span>
    )
  }

export default SectionBreak;