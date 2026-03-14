import styles from "../styles/components/loading.module.css";

export function LoadingComponent() {
    return (
        <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
        </div>
    );
}