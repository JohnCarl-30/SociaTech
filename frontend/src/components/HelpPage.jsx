import {CircleQuestionMark,X } from 'lucide-react';
import "./HelpPage.css"

export default function HelpPage({openPage, closePage}){
    return(<>
        <div className='helpPage_parent_container' style={{display: openPage ? 'flex':'none'}}>
            <button className="helpPage_close_btn" onClick={closePage}>
          <X className="crossSvg" />
        </button>
            <div className='helpPage_child_container'>
                <div className='helpPage_title'><CircleQuestionMark/>Help</div>
                <div className='helpPage_content_container'>
                    <div className='helpPage_content_title'>About our system</div>
                    <div>Our platform is designed to help students, teachers, and learners connect through collaborative learning. You can create posts, ask academic questions, share knowledge, and interact with other users through comments and votes. We also use a badge and leaderboard system to recognize active contributors.</div>
                </div>
                <div className='helpPage_content_container'>
                    <div className='helpPage_content_title'>Commenting</div>
                    <div>You can leave comments on any public post to share answers, clarifications, or opinions. Helpful comments that receive many upvotes improve your credibility and may help you earn subject-specific badges. Make sure your comments follow our community guidelines and remain respectful.</div>
                </div>
                <div className='helpPage_content_container' style={{gap:'0rem'}}>
                    <div className='helpPage_content_title'>Report</div>
                        <div className='helpPage_report_content'>
                            <p>If you see any post, comment, or user behavior that goes against our community guidelines, you can report it using the Report button found in the options menu (⋯) of each post or user profile.</p>
                            <p style={{fontWeight:600}}>You may report content for the following reasons:</p>
                            <ul>
                                <li>Spam or misleading content</li>
                                <li>Harassment or abusive behavior</li>
                                <li>nappropriate or NSFW material</li>
                                <li>False information</li>
                                <li>Nonsense or irrelevant content</li>
                                <li>Plagiarism or stolen content</li>
                            </ul>
                            <p>Once a report is submitted, our moderation team will review it. If the content violates our policies, appropriate action will be taken, which may include removing the post or restricting the user's account.
                            Reporting helps keep our community safe, respectful, and academically focused.</p>
                        </div>
                    
                </div>
                 <div className='helpPage_content_container'>
                    <div className='helpPage_content_title'>Voting</div>
                    
                    <div>
                        <p> Each post and comment can receive an upvote or downvote.</p>
                        <ul>
                           
                            <li>Upvote content that is helpful, accurate, or insightful.</li>
                            <li>Downvote content that is off-topic, incorrect, or unhelpful.Posts and comments with higher votes appear more prominently and help improve the quality of the community.</li>
                        </ul>
                    </div>
                </div>
                <div className='helpPage_content_container'>
                    <div className='helpPage_content_title'>Contact Support</div>
                    <div className=''>If you encounter technical issues, experience inappropriate behavior, or need assistance, feel free to send us an email at <span style={{fontWeight:600}}>SociaTech@gmail.com</span>. Our support team will respond as soon as possible.</div>
                </div>
            </div>
        </div>
    </>)
}