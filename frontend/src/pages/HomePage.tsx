import { AtomIcon, HardDrivesIcon } from '@phosphor-icons/react';
import style from '../styles/home.module.css';

export function HomePage() {
    return (
        <div className={style.homeContainer}>
            <div className={style.homeHeader}>
                <AtomIcon size={48} weight='fill'>Logo</AtomIcon>
                <div className={style.homeTitle}>
                    <h1>Job Tracker</h1>
                </div>
                <div>
                    <a className={style.navButton} href='/login'>Login</a>
                    <a className={style.navButton} href='/register'>Register</a>
                </div>
            </div>
            <div className={style.homeBody}>
                <div className={style.homeMessage}><a href='/login'>Login</a> or <a href='/register'>Register</a> to access your<br/> Job Application Tracker</div>
            </div>    
            <div className={style.homeImage}></div>
            <footer>
                <HardDrivesIcon size={32}></HardDrivesIcon>
                <a href="https://github.com/KristijanTuric" title="github link">Made by Kristijan T</a>
                <a href="https://www.flaticon.com/free-icons/job" title="job icons">Tab Job icon by Freepik - Flaticon</a>
            </footer>
        </div>
    );
}