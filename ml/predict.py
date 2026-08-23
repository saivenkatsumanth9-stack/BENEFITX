import joblib
import pandas as pd
import numpy as np

def predict_scheme_outcome(profile_dict):
    clf = joblib.load('S:/benefit-navigator-main/ml/models/best_approval_classifier.joblib')
    reg = joblib.load('S:/benefit-navigator-main/ml/models/best_grant_regressor.joblib')
    
    df = pd.DataFrame([profile_dict])
    prob = clf.predict_proba(df)[0, 1]
    is_approved = int(prob >= 0.50)
    grant_amount = reg.predict(df)[0]
    
    return {
        'approval_status': 'APPROVED' if is_approved == 1 else 'REJECTED',
        'approval_probability': round(float(prob) * 100, 2),
        'predicted_grant_inr': max(0, round(float(grant_amount), 2)),
        'risk_of_rejection': round(float(1.0 - prob) * 100, 2),
        'model_architecture': 'XGBoost Custom-Trained Gradient Boosted Trees',
    }

if __name__ == '__main__':
    print('=' * 70)
    print('BENEFITX -- TRACK 2: THE PREDICTION ENGINE LIVE ML INTELLIGENCE')
    print('=' * 70)
    
    personas = [
        (
            'Aarav Reddy (Student, Telangana, Age 21, Income INR 1.2L)',
            'National Merit Scholarship (scheme-001)',
            {
                'gender': 'Male', 'state': 'Telangana', 'area_type': 'Urban',
                'occupation': 'Student', 'education_level': 'Undergraduate',
                'scheme_id': 'scheme-001', 'scheme_category': 'Education',
                'age': 21, 'annual_income_inr': 120000, 'is_student': 1, 'is_farmer': 0,
                'land_holding_acres': 0.0, 'has_disability': 0, 'is_senior_citizen': 0,
                'has_aadhaar': 1, 'has_income_cert': 1, 'has_bank_passbook': 1, 'has_edu_cert': 1,
                'document_readiness_score': 100.0, 'max_income_limit': 300000,
                'scheme_benefit_value_inr': 20000, 'eligibility_match_score': 95
            }
        ),
        (
            'Rajesh Kumar (Farmer, Andhra Pradesh, Age 42, Income INR 1.8L)',
            'PM Kisan Samman Nidhi (scheme-003)',
            {
                'gender': 'Male', 'state': 'Andhra Pradesh', 'area_type': 'Rural',
                'occupation': 'Farmer', 'education_level': '10th Pass',
                'scheme_id': 'scheme-003', 'scheme_category': 'Agriculture',
                'age': 42, 'annual_income_inr': 180000, 'is_student': 0, 'is_farmer': 1,
                'land_holding_acres': 3.5, 'has_disability': 0, 'is_senior_citizen': 0,
                'has_aadhaar': 1, 'has_income_cert': 1, 'has_bank_passbook': 1, 'has_edu_cert': 0,
                'document_readiness_score': 87.5, 'max_income_limit': 400000,
                'scheme_benefit_value_inr': 6000, 'eligibility_match_score': 100
            }
        ),
        (
           'Vikram Mehta (Salaried, Maharashtra, Age 45, Income INR 11L)',
            'PM Kisan Samman Nidhi (scheme-003 -- Farmer Required)',
            {
                'gender': 'Male', 'state': 'Maharashtra', 'area_type': 'Urban',
                'occupation': 'Salaried', 'education_level': 'Postgraduate',
                'scheme_id': 'scheme-003', 'scheme_category': 'Agriculture',
                'age': 45, 'annual_income_inr': 1100000, 'is_student': 0, 'is_farmer': 0,
                'land_holding_acres': 0.0, 'has_disability': 0, 'is_senior_citizen': 0,
                'has_aadhaar': 1, 'has_income_cert': 0, 'has_bank_passbook': 1, 'has_edu_cert': 1,
                'document_readiness_score': 50.0, 'max_income_limit': 400000,
                'scheme_benefit_value_inr': 6000, 'eligibility_match_score': 0
            }
        )
    ]

    for name, scheme, payload in personas:
        res = predict_scheme_outcome(payload)
        print(f"\nApplicant: {name}")
        print(f"Target Scheme: {scheme}")
        print('-' * 70)
        print(f"Prediction Output:")
        print(f"  [*] Outcome Status:            {res['approval_status']}")
        print(f"  [*] Grant Approval Probability: {res['approval_probability']}%")
        print(f"  [*] Forecasted Grant Amount:    INR {res['predicted_grant_inr']:.2f}")
        print(f"  [*] Risk of Rejection:         {res['risk_of_rejection']}%")
        print(f"  [*] Model Engine:              {res['model_architecture']}")
    print('=' * 70)
