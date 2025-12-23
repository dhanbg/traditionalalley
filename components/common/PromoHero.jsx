import React from 'react';
import styles from './PromoHero.module.css';

export default function PromoHero() {
    return (
        <section className={styles.promoHero}>
            <picture>
                <source media="(max-width: 768px)" srcSet="/christmas-M.png" />
                <img
                    src="/christmas-L.png"
                    alt="Christmas Sale"
                    className={styles.heroImage}
                />
            </picture>
        </section>
    );
}
