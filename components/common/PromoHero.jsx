import React from 'react';
import styles from './PromoHero.module.css';

export default function PromoHero() {
    return (
        <section className={styles.promoHero}>
            <picture>
                <source media="(max-width: 768px)" srcSet="/New%20Year-M.png" />
                <img
                    src="/New%20Year-L.png"
                    alt="New Year Sale"
                    className={styles.heroImage}
                />
            </picture>
        </section>
    );
}
