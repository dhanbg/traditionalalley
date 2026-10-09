import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { useNPS } from "@/utils/useNPS";
import { useContextElement } from "@/context/Context";
import { NPS_INSTRUMENTS, NPSInstrument } from "@/data/npsInstruments";

interface NPSPaymentFormProps {
  amount: number;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  orderData?: any;
  transactionRemarks?: string;
  disabled?: boolean;
  shippingRatesObtained?: boolean;
  getUserBagDocumentId?: () => Promise<string | null>;
}

type MainCategory = 'KHALTI' | 'BANKS' | 'CARDS' | 'OTHER';

export default function NPSPaymentForm({
  amount,
  onSuccess,
  onError,
  orderData,
  transactionRemarks,
  disabled = false,
  shippingRatesObtained = false,
  getUserBagDocumentId,
}: NPSPaymentFormProps) {
  const { data: session } = useSession();
  const { userCurrency } = useContextElement();
  const [isLoading, setIsLoading] = useState(false);

  // Categorization states
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('KHALTI');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('KHALTIG');

  // Instruments categorized per user requirement:
  // 1. Khalti
  // 2. Banks (Mobile Banking)
  // 3. Card payments
  // 4. Other (Remaining digital wallets)
  const khaltiInstrument = useMemo(
    () => NPS_INSTRUMENTS.find((i) => i.InstrumentCode === 'KHALTIG' || i.InstitutionName.toLowerCase().includes('khalti')),
    []
  );

  const cardInstrument = useMemo(
    () => NPS_INSTRUMENTS.find((i) => i.BankType === 'checkoutcard' || i.InstrumentCode === 'NICCARD'),
    []
  );

  const mobileBanksList = useMemo(
    () => NPS_INSTRUMENTS.filter((i) => i.BankType === 'MBanking'),
    []
  );

  const remainingWalletsList = useMemo(
    () =>
      NPS_INSTRUMENTS.filter(
        (i) =>
          i.BankType === 'CheckoutGateway' &&
          i.InstrumentCode !== 'KHALTIG' &&
          !i.InstitutionName.toLowerCase().includes('khalti')
      ),
    []
  );

  // Use the NPS hook with proper redirect handling
  const { initiate } = useNPS({
    onSuccess: (response) => {
      console.log('NPS Payment initiated successfully, redirecting to gateway...');
      onSuccess(response);
    },
    onError: (error) => {
      console.error('NPS Payment initiation failed:', error);
      onError(error);
    },
    orderData,
    autoRedirect: true,
  });

  const handleCategorySelect = (category: MainCategory) => {
    setSelectedCategory(category);
    if (category === 'KHALTI') {
      setSelectedInstrument(khaltiInstrument?.InstrumentCode || 'KHALTIG');
    } else if (category === 'CARDS') {
      setSelectedInstrument(cardInstrument?.InstrumentCode || 'NICCARD');
    } else if (category === 'BANKS') {
      if (!mobileBanksList.some((b) => b.InstrumentCode === selectedInstrument)) {
        setSelectedInstrument(mobileBanksList[0]?.InstrumentCode || 'MBGLOBAL');
      }
    } else if (category === 'OTHER') {
      setSelectedInstrument(remainingWalletsList[0]?.InstrumentCode || 'HAMROPAYG');
    }
  };

  const handlePayment = async () => {
    const isAdmin =
      session?.user?.role === 'admin' ||
      session?.user?.email === 'gurungvaaiii@gmail.com' ||
      session?.user?.email === 'traditionalley2050@gmail.com';
    if (!shippingRatesObtained && !isAdmin) {
      onError({ message: 'Please calculate shipping rates before initiating payment.' });
      return;
    }

    setIsLoading(true);
    try {
      let userBagId: string | undefined = undefined;
      if (getUserBagDocumentId) {
        const id = await getUserBagDocumentId();
        if (id) userBagId = id;
      }

      const merchantTxnId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const paymentRequest = {
        amount,
        merchantTxnId,
        instrumentCode: selectedInstrument || undefined,
        transactionRemarks: transactionRemarks || `Payment for order ${merchantTxnId}`,
        customer_info: {
          name: session?.user?.name || orderData?.receiver_details?.name || 'Guest Customer',
          email: session?.user?.email || orderData?.receiver_details?.email || 'guest@example.com',
          phone: orderData?.receiver_details?.phone || '',
        },
        userBagDocumentId: userBagId,
      };

      if (userBagId) {
        try {
          localStorage.setItem(`nps_txn_${merchantTxnId}`, userBagId);
          console.log(`Saved payment context for guest recovery: ${merchantTxnId} -> ${userBagId}`);
        } catch (e) {
          console.warn('Could not save payment context to localStorage', e);
        }
      }

      await initiate(paymentRequest);
    } catch (error) {
      console.error('Payment initiation error:', error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nps-payment-form">
      {/* Currency conversion notice - only show in USD mode */}
      {userCurrency === 'USD' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px' }}>💱</span>
          <span style={{ color: '#1565c0', fontSize: '14px', fontWeight: '500' }}>
            Your amount is converted to Nepali currency for payment processing
          </span>
        </div>
      )}

      {/* Main Payment Categories */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--checkout-text-color, #424242)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Choose Payment Mode
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}
        >
          {/* 1. Khalti */}
          <button
            type="button"
            onClick={() => handleCategorySelect('KHALTI')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedCategory === 'KHALTI' ? '2px solid #5c2d91' : '1px solid #e0e0e0',
              background: selectedCategory === 'KHALTI' ? 'rgba(92, 45, 145, 0.08)' : 'var(--checkout-card-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategory === 'KHALTI' ? '0 2px 8px rgba(92, 45, 145, 0.2)' : 'none',
            }}
          >
            <img
              src={khaltiInstrument?.LogoUrl || 'https://apigateway.nepalpayment.com/UploadedImages/PaymentInstitution/LogoUrl-202607281527S.png'}
              alt="Khalti"
              style={{ height: '22px', maxWidth: '65px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '11px', fontWeight: '600', color: selectedCategory === 'KHALTI' ? '#5c2d91' : '#424242' }}>
              Khalti
            </span>
          </button>

          {/* 2. Banks */}
          <button
            type="button"
            onClick={() => handleCategorySelect('BANKS')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedCategory === 'BANKS' ? '2px solid #2e7d32' : '1px solid #e0e0e0',
              background: selectedCategory === 'BANKS' ? 'rgba(46, 125, 50, 0.08)' : 'var(--checkout-card-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategory === 'BANKS' ? '0 2px 8px rgba(46, 125, 50, 0.2)' : 'none',
            }}
          >
            <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={selectedCategory === 'BANKS' ? '#2e7d32' : '#555555'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"/>
              </svg>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: selectedCategory === 'BANKS' ? '#2e7d32' : '#424242' }}>
              Banks
            </span>
          </button>

          {/* 3. Card Payments */}
          <button
            type="button"
            onClick={() => handleCategorySelect('CARDS')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedCategory === 'CARDS' ? '2px solid #1976d2' : '1px solid #e0e0e0',
              background: selectedCategory === 'CARDS' ? 'rgba(25, 118, 210, 0.08)' : 'var(--checkout-card-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategory === 'CARDS' ? '0 2px 8px rgba(25, 118, 210, 0.2)' : 'none',
            }}
          >
            <img
              src={cardInstrument?.LogoUrl || 'https://apigateway.nepalpayment.com/UploadedImages/PaymentInstitution/LogoUrl-202304261129S76.png'}
              alt="Cards"
              style={{ height: '22px', maxWidth: '65px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '11px', fontWeight: '600', color: selectedCategory === 'CARDS' ? '#1976d2' : '#424242' }}>
              Cards
            </span>
          </button>

          {/* 4. Other */}
          <button
            type="button"
            onClick={() => handleCategorySelect('OTHER')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: selectedCategory === 'OTHER' ? '2px solid #e65100' : '1px solid #e0e0e0',
              background: selectedCategory === 'OTHER' ? 'rgba(230, 81, 0, 0.08)' : 'var(--checkout-card-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategory === 'OTHER' ? '0 2px 8px rgba(230, 81, 0, 0.2)' : 'none',
            }}
          >
            <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={selectedCategory === 'OTHER' ? '#e65100' : '#555555'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="13" rx="2"/>
                <path d="M16 12.5h4v2h-4zM2 10h20M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: selectedCategory === 'OTHER' ? '#e65100' : '#424242' }}>
              Other
            </span>
          </button>
        </div>
      </div>

      {/* Subcategory Details / Lists */}
      <div
        style={{
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          background: 'var(--checkout-card-bg, #fafafa)',
        }}
      >
        {/* Khalti Panel */}
        {selectedCategory === 'KHALTI' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px' }}>
            <img
              src={khaltiInstrument?.LogoUrl || 'https://apigateway.nepalpayment.com/UploadedImages/PaymentInstitution/LogoUrl-202607281527S.png'}
              alt="Khalti"
              style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #eee' }}
            />
            <div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#212121' }}>Khalti Digital Wallet</div>
              <div style={{ fontSize: '11px', color: '#757575' }}>Pay directly using your Khalti account or wallet MPIN</div>
            </div>
          </div>
        )}

        {/* Card Payments Panel */}
        {selectedCategory === 'CARDS' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px' }}>
            <img
              src={cardInstrument?.LogoUrl || 'https://apigateway.nepalpayment.com/UploadedImages/PaymentInstitution/LogoUrl-202304261129S76.png'}
              alt="Cards"
              style={{ width: '56px', height: '36px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '4px', border: '1px solid #eee' }}
            />
            <div>
              <div style={{ fontWeight: '600', fontSize: '13px', color: '#212121' }}>Debit & Credit Cards</div>
              <div style={{ fontSize: '11px', color: '#757575' }}>Visa, MasterCard, SCT & UnionPay accepted via secure gateway</div>
            </div>
          </div>
        )}

        {/* Banks (Mobile Banking) Panel */}
        {selectedCategory === 'BANKS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px', color: '#616161' }}>
              <span><strong>Choose Mobile Banking App:</strong></span>
              <span>{mobileBanksList.length} Banks</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px',
                maxHeight: '210px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {mobileBanksList.map((bank) => {
                const isSelected = selectedInstrument === bank.InstrumentCode;
                const isGlobal = bank.InstrumentCode === 'MBGLOBAL';
                return (
                  <button
                    key={bank.InstrumentCode}
                    type="button"
                    onClick={() => setSelectedInstrument(bank.InstrumentCode)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #2e7d32' : '1px solid #e0e0e0',
                      background: isSelected ? 'rgba(46, 125, 50, 0.08)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={bank.LogoUrl}
                      alt={bank.InstrumentName}
                      style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: isSelected ? '600' : '500', color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isGlobal ? 'Global SMART+' : bank.InstrumentName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Panel (Wallets) */}
        {selectedCategory === 'OTHER' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px', color: '#616161' }}>
              <span><strong>Choose Digital Wallet:</strong></span>
              <span>{remainingWalletsList.length} Wallets</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px',
              }}
            >
              {remainingWalletsList.map((wallet) => {
                const isSelected = selectedInstrument === wallet.InstrumentCode;
                return (
                  <button
                    key={wallet.InstrumentCode}
                    type="button"
                    onClick={() => setSelectedInstrument(wallet.InstrumentCode)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #e65100' : '1px solid #e0e0e0',
                      background: isSelected ? 'rgba(230, 81, 0, 0.08)' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={wallet.LogoUrl}
                      alt={wallet.InstrumentName}
                      style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: isSelected ? '600' : '500', color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wallet.InstrumentName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading || disabled}
        className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center fw-6"
        style={{
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? "Processing..." : `Pay Rs.${amount}`}
      </button>
    </div>
  );
}
