import styles from "../styles/components/loading.module.css";

export function DataLoadingComponent() {
    return (
        <div className={styles.clearLoadingOverlay}>
            <div className={styles.loadingSpinner}></div>
        </div>
    );
}