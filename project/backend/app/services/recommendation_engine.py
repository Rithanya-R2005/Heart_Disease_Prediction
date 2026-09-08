from typing import List, Dict, Any
from app.schemas.predict import HealthInsight, Recommendation

class RecommendationEngine:
    @staticmethod
    def generate_assessment(
        data: Dict[str, Any],
        calculated: Dict[str, float],
        risk_probability: float,
        risk_level: str
    ) -> Dict[str, Any]:
        """
        Generates dynamic personalized insights and prioritized recommendations
        based on user health inputs and model prediction results.
        """
        insights: List[HealthInsight] = []
        recommendations: List[Recommendation] = []
        rec_id = 1

        age = data["age"]
        systolic = data["systolic_bp"]
        diastolic = data["diastolic_bp"]
        cholesterol = data["cholesterol"]
        glucose = data["glucose"]
        smoke = data["smoke"]
        alcohol = data["alcohol"]
        active = data["physical_activity"]
        bmi = calculated["bmi"]
        pulse_pressure = calculated["pulse_pressure"]
        map_val = calculated["map"]

        # -------------------------------------------------------------
        # 1. GENERATE PERSONALIZED HEALTH INSIGHTS
        # -------------------------------------------------------------

        # Blood Pressure Insight
        if systolic >= 140 or diastolic >= 90:
            insights.append(HealthInsight(
                category="Blood Pressure",
                title="Elevated Blood Pressure Detected",
                description=f"Your blood pressure ({systolic:.0f}/{diastolic:.0f} mmHg) is in an elevated range. High arterial pressure is a significant factor in cardiovascular assessment.",
                impact="High Risk"
            ))
        elif systolic >= 130 or diastolic >= 85:
            insights.append(HealthInsight(
                category="Blood Pressure",
                title="Pre-hypertension Range",
                description=f"Your blood pressure reading ({systolic:.0f}/{diastolic:.0f} mmHg) borders above optimal ranges. Proactive lifestyle measures can help normalize trends.",
                impact="Attention"
            ))
        else:
            insights.append(HealthInsight(
                category="Blood Pressure",
                title="Optimal Blood Pressure",
                description=f"Your blood pressure ({systolic:.0f}/{diastolic:.0f} mmHg) and mean arterial pressure ({map_val:.1f} mmHg) reflect favorable circulatory health.",
                impact="Positive"
            ))

        # Body Composition Insight
        if bmi >= 30.0:
            insights.append(HealthInsight(
                category="Body Composition",
                title="Elevated Body Mass Index (BMI)",
                description=f"Calculated BMI of {bmi:.1f} kg/m² places body mass in the obese category, which elevates systemic cardiac workload.",
                impact="High Risk"
            ))
        elif bmi >= 25.0:
            insights.append(HealthInsight(
                category="Body Composition",
                title="Overweight BMI Range",
                description=f"Calculated BMI of {bmi:.1f} kg/m² indicates excess body mass that may benefit from balanced dietary and activity adjustments.",
                impact="Attention"
            ))
        else:
            insights.append(HealthInsight(
                category="Body Composition",
                title="Healthy Weight Range",
                description=f"Calculated BMI of {bmi:.1f} kg/m² sits within the healthy body composition range.",
                impact="Positive"
            ))

        # Metabolic Markers Insight (Cholesterol & Glucose)
        if cholesterol in ["Above Normal", "High"] or glucose in ["Above Normal", "High"]:
            insights.append(HealthInsight(
                category="Metabolic Markers",
                title="Metabolic Factors Consideration",
                description=f"Recorded cholesterol ({cholesterol}) and glucose levels ({glucose}) were evaluated as contributing metabolic indicators in your risk profile.",
                impact="Attention" if cholesterol == "Above Normal" and glucose == "Above Normal" else "High Risk"
            ))
        else:
            insights.append(HealthInsight(
                category="Metabolic Markers",
                title="Normal Metabolic Profile",
                description="Cholesterol and glucose indicators remain within standard reference ranges.",
                impact="Positive"
            ))

        # Lifestyle Habits Insight
        lifestyle_issues = []
        if smoke == "Yes":
            lifestyle_issues.append("tobacco use")
        if alcohol == "Yes":
            lifestyle_issues.append("regular alcohol intake")
        if active == "No":
            lifestyle_issues.append("sedentary activity pattern")

        if lifestyle_issues:
            insights.append(HealthInsight(
                category="Lifestyle Factors",
                title="Modifiable Risk Factors Identified",
                description=f"Evaluation highlighted: {', '.join(lifestyle_issues)}. Addressing these behaviors offers substantial long-term heart benefits.",
                impact="Attention" if len(lifestyle_issues) == 1 else "High Risk"
            ))
        else:
            insights.append(HealthInsight(
                category="Lifestyle Factors",
                title="Healthy Lifestyle Habits",
                description="Non-smoking status, limited alcohol consumption, and routine physical activity support positive cardiac health.",
                impact="Positive"
            ))

        # -------------------------------------------------------------
        # 2. GENERATE DYNAMIC RECOMMENDATIONS
        # -------------------------------------------------------------

        # Overall Risk Level Primary Recommendation
        if risk_level == "High Risk":
            recommendations.append(Recommendation(
                id=rec_id,
                title="Schedule a Professional Clinical Evaluation",
                description="Because your overall assessment indicates elevated heart disease risk factors, we strongly recommend consulting a physician or cardiologist for comprehensive evaluation.",
                category="Medical Care",
                priority="High"
            ))
            rec_id += 1
        elif risk_level == "Moderate Risk":
            recommendations.append(Recommendation(
                id=rec_id,
                title="Discuss Health Profile with Your Doctor",
                description="Your risk assessment highlights moderate potential indicators. Scheduling routine preventive wellness reviews will help manage modifiable markers.",
                category="Medical Care",
                priority="Medium"
            ))
            rec_id += 1
        else:
            recommendations.append(Recommendation(
                id=rec_id,
                title="Maintain Preventive Health Monitoring",
                description="Your estimated risk score is low. Continue annual check-ups and standard health screenings to sustain good cardiovascular health.",
                category="Maintenance",
                priority="Low"
            ))
            rec_id += 1

        # Blood Pressure Recommendation
        if systolic >= 130 or diastolic >= 85:
            recommendations.append(Recommendation(
                id=rec_id,
                title="Implement Regular Blood Pressure Tracking",
                description=f"Monitor your blood pressure 2-3 times per week. Reduce dietary sodium consumption and maintain optimal hydration.",
                category="Blood Pressure",
                priority="High" if systolic >= 140 else "Medium"
            ))
            rec_id += 1

        # BMI / Weight Recommendation
        if bmi >= 25.0:
            recommendations.append(Recommendation(
                id=rec_id,
                title="Adopt Nutrient-Dense Weight Management",
                description="Focus on a whole-food diet rich in fiber, lean proteins, and unsaturated fats to achieve a gradual, sustainable reduction in body weight.",
                category="Nutrition",
                priority="High" if bmi >= 30.0 else "Medium"
            ))
            rec_id += 1

        # Smoking Cessation Recommendation
        if smoke == "Yes":
            recommendations.append(Recommendation(
                id=rec_id,
                title="Explore Tobacco Cessation Programs",
                description="Quitting smoking rapidly reduces arterial inflammation and lowers coronary risk within months of cessation.",
                category="Lifestyle",
                priority="High"
            ))
            rec_id += 1

        # Physical Activity Recommendation
        if active == "No":
            recommendations.append(Recommendation(
                id=rec_id,
                title="Incorporate 150 Minutes of Moderate Activity Weekly",
                description="Engage in brisk walking, swimming, or cycling for 30 minutes a day, 5 days a week to enhance cardiovascular efficiency and circulation.",
                category="Fitness",
                priority="High" if risk_level == "High Risk" else "Medium"
            ))
            rec_id += 1

        # Cholesterol / Glucose Recommendation
        if cholesterol in ["Above Normal", "High"] or glucose in ["Above Normal", "High"]:
            recommendations.append(Recommendation(
                id=rec_id,
                title="Manage Metabolic & Lipid Profiles",
                description="Consider requesting a comprehensive lipid panel and HbA1c screening during your next physician visit to guide targeted dietary choices.",
                category="Metabolism",
                priority="Medium"
            ))
            rec_id += 1

        # Alcohol Moderation Recommendation
        if alcohol == "Yes":
            recommendations.append(Recommendation(
                id=rec_id,
                title="Practice Alcohol Moderation",
                description="Limit alcoholic beverage intake to low or moderate guidelines to avoid blood pressure spikes and liver metabolic strain.",
                category="Lifestyle",
                priority="Medium"
            ))
            rec_id += 1

        # Pulse Pressure / Arterial Compliance Recommendation
        if pulse_pressure >= 60:
            recommendations.append(Recommendation(
                id=rec_id,
                title="Arterial Stiffness Awareness",
                description=f"Your pulse pressure ({pulse_pressure:.0f} mmHg) is elevated. Ensure adequate potassium intake and regular aerobic exercise to support vessel elasticity.",
                category="Vascular Health",
                priority="Medium"
            ))
            rec_id += 1

        # General Heart Maintenance if recommendations < 4
        if len(recommendations) < 4:
            recommendations.append(Recommendation(
                id=rec_id,
                title="Prioritize Quality Sleep & Stress Reduction",
                description="Aim for 7-9 hours of restful sleep daily and practice mindfulness or breathwork to minimize chronic cardiovascular stress.",
                category="Wellness",
                priority="Low"
            ))
            rec_id += 1

        # Cap recommendations between 4 and 7 high-priority items
        recommendations = recommendations[:7]

        return {
            "insights": [insight.model_dump() for insight in insights],
            "recommendations": [rec.model_dump() for rec in recommendations]
        }
