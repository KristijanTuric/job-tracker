import { AtomIcon, HardDrivesIcon } from '@phosphor-icons/react';
import style from '../styles/home.module.css';
import { Link } from 'react-router-dom';

export function HomePage() {
    return (
        <div className={style.homeContainer}>
            <div className={style.homeHeader}>
                <AtomIcon size={48} weight='fill'>Logo</AtomIcon>
                <div className={style.homeTitle}>
                    <h1>Job Tracker</h1>
                </div>
                <div>
                    <Link className={style.navButton} to='/login'>Login</Link>
                    <Link className={style.navButton} to='/register'>Register</Link>
                </div>
            </div>
            <div className={style.homeBody}>
                <div className={style.homeMessage}><Link to='/login'>Login</Link> or <Link to='/register'>Register</Link> to access your<br/> Job Application Tracker</div>
            </div>    
            <div className={style.homeImage}></div>
            <footer>
                <HardDrivesIcon size={32}></HardDrivesIcon>
                <a target='_blank' href="https://github.com/KristijanTuric" title="github link">Made by Kristijan T</a>
                <a target='_blank' href="https://www.flaticon.com/free-icons/job" title="job icons">Tab Job icon by Freepik - Flaticon</a>
            </footer>
        </div>
    );
}