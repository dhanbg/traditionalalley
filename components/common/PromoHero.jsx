import React from 'react';
import styles from './PromoHero.module.css';

export default function PromoHero() {
    return (
        <section className={styles.promoHero}>
            <div className={styles.decorFlowerTopRight}>
                <img src="/flowers.png" alt="" aria-hidden="true" />
            </div>
            <div className={styles.decorFlowerBottomLeft}>
                <img src="/flowers.png" alt="" aria-hidden="true" />
            </div>

            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <h1 className={styles.mainHeading}>
                        SHOP<br />WITH US
                    </h1>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.rightSection}>
                    <p className={styles.eyebrow}>ENJOY UP TO</p>
                    <h2 className={styles.offerHeading}>20% OFF</h2>
                    <p className={styles.details}>
                        ON SELECTED ITEMS.<br />
                        USE CODE: <span className={styles.code}>TAGIRLME</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
