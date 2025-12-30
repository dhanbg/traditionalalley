import React from 'react';
import styles from './PromoHero.module.css';

export default function PromoHero() {
    return (
        <section className={styles.promoHero}>
            <picture>
                <source media="(max-width: 768px)" srcSet="https://raw.githubusercontent.com/dhanbg/traditionalalley/refs/heads/main/public/New%20Year-M.png" />
                <img
                    src="https://raw.githubusercontent.com/dhanbg/traditionalalley/refs/heads/main/public/New%20Year-L.png"
                    alt="New Year Sale"
                    className={styles.heroImage}
                />
            </picture>
        </section>
    );
}
