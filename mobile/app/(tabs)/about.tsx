import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { colors, radius, spacing, shadow } from "../../src/theme/theme";

const LINKS = {
  portfolio: "https://sagarpatole113.github.io/portfolio/",
  email: "mailto:sagarpatole113@gmail.com",
  github: "https://github.com/sagarpatole113",
  linkedin: "https://www.linkedin.com/in/sagar-patole-953015182/",
};

const TECH_STACK = [
  ".NET / C#",
  "ASP.NET Core",
  "React",
  "Angular",
  "Node.js",
  "PostgreSQL",
  "MongoDB",
  "REST APIs",
];

const PROJECTS = [
  { name: "FLEETPULSE", blurb: "Fleet Management & Real-Time Tracking" },
  { name: "FOOD FLOW", blurb: "Real-Time Order Management" },
];

function openLink(url: string) {
  Linking.openURL(url).catch(() => { });
}

export default function AboutScreen() {
  const [showChaiQR, setShowChaiQR] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/profile.jpg")}
            style={styles.profileImage}
          />

          <Text style={styles.name}>Sagar Patole</Text>
          <Text style={styles.role}>Full Stack Developer</Text>
          <Text style={styles.company}>
            Freelancer · Jalna, Maharashtra
          </Text>
        </View>

        {/* ABOUT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <Text style={styles.bodyText}>
            सातत्य का?
            सध्या job शोधतोय, आणि वाटलं — React Native शिकायचं असेल तर काहीतरी खरंच build करूया. मग काय… vibe coding करून सातत्य build केलं. 😂
            MPSC ची तयारी करणाऱ्या students ना free daily mock tests सहज मिळत नाहीत हे जाणवलं. माझा coaching class नाही, questions चा खजिना नाही… म्हणून AI ला कामाला लावलं 😄
            App सध्या free-tier services वर चालतोय. त्यामुळे users अचानक वाढले तर सातत्यामध्ये सातत्य राहणार नाही. 💀😂
            आणि हो, चहासाठी QR code पण दिलाय. ☕
            कारण free app बनवणं सोपं आहे… free मध्ये जगणं थोडं कठीण आहे. 😂
            पैसे देणं अजिबात compulsory नाही — पण QR code कडे बघून guilt trip घ्यायची की नाही, ते पूर्णपणे तुमच्यावर आहे. 😂
            Bug, wrong question किंवा suggestion असेल तर email करा किंवा Telegram group मध्ये सांगा.
          </Text>
        </View>

        {/* TECH STACK */}
        {/* <View style={styles.card}>
        <Text style={styles.sectionTitle}>TECH STACK</Text>

        <View style={styles.chipRow}>
          {TECH_STACK.map((t) => (
            <View key={t} style={styles.chip}>
              <Text style={styles.chipText}>{t}</Text>
            </View>
          ))}
        </View>
      </View> */}

        {/* PROJECTS
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>PROJECTS</Text>

        {PROJECTS.map((p, i) => (
          <View
            key={p.name}
            style={[
              styles.projectRow,
              i === PROJECTS.length - 1 && { marginBottom: 0 },
            ]}
          >
            <View style={styles.projectDot} />

            <View style={{ flex: 1 }}>
              <Text style={styles.projectName}>{p.name}</Text>
              <Text style={styles.projectBlurb}>{p.blurb}</Text>
            </View>
          </View>
        ))}
      </View> */}

        {/* BUY ME A CHAI */}
        <View style={styles.chaiCard}>
          <Pressable
            style={styles.chaiTapArea}
            onPress={() => setShowChaiQR(true)}

          >
            <View style={styles.chaiIconContainer}>
              <Text style={styles.chaiEmoji}>☕</Text>
            </View>

            <View style={styles.chaiContent}>
              <Text style={styles.chaiTitle}>
                Buy Me a Chai
              </Text>

              <Text style={styles.chaiText}>
                Enjoying the app? Scan and treat the developer to a chai.
              </Text>
            </View>

            <View style={styles.scanBadge}>
              <Text style={styles.scanBadgeText}>
                SCAN
              </Text>
            </View>
          </Pressable>
        </View>


        {/* SOCIAL LINKS */}
        {/* <View style={styles.linksRow}>
        <Pressable
          style={styles.linkButton}
          onPress={() => openLink(LINKS.portfolio)}
        >
          <Text style={styles.linkButtonText}>Portfolio</Text>
        </Pressable>

        <Pressable
          style={[styles.linkButton, styles.linkButtonGhost]}
          onPress={() => openLink(LINKS.github)}
        >
          <Text style={styles.linkButtonGhostText}>GitHub</Text>
        </Pressable>

        <Pressable
          style={[styles.linkButton, styles.linkButtonGhost]}
          onPress={() => openLink(LINKS.linkedin)}
        >
          <Text style={styles.linkButtonGhostText}>LinkedIn</Text>
        </Pressable>
      </View> */}

        <Pressable onPress={() => openLink(LINKS.email)}>
          <Text style={styles.emailLink}>Get in touch →</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showChaiQR}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChaiQR(false)}

      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModal}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowChaiQR(false)}
            >
              <Text style={styles.closeButtonText}>
                ✕
              </Text>
            </Pressable>

            <View style={styles.qrHeader}>
              <View style={styles.qrChaiCircle}>
                <Text style={styles.qrChaiEmoji}>
                  ☕
                </Text>
              </View>

              <Text style={styles.qrTitle}>
                Buy Me a Chai
              </Text>

              <Text style={styles.qrSubtitle}>
                Scan with any UPI app and send some chai love ❤️
              </Text>
            </View>

            <View style={styles.qrContainer}>
              <Image
                source={require("../../assets/chai-qr.jpeg")}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.qrFooter}>
              <Text style={styles.qrFooterText}>
                Powered by chai, bugs and late-night coding 💻☕
              </Text>
            </View>
          </View>

        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scroll: {
    padding: spacing.xl,
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },

  profileImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadow.soft,
  },

  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  role: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  company: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },

  sectionTitle: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },

  bodyText: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 22,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },

  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },

  projectRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },

  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.md,
  },

  projectName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  projectBlurb: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },

  /* BUY ME A CHAI CARD */
  chaiCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    overflow: "hidden",
  },

  chaiTapArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },

  chaiIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    ...shadow.button,
  },

  chaiEmoji: {
    fontSize: 26,
  },

  chaiContent: {
    flex: 1,
  },

  chaiTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },

  chaiText: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  scanBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },

  scanBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  /* LINKS */
  linksRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginTop: spacing.xs,
  },

  linkButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
    ...shadow.button,
  },

  linkButtonText: {
    color: colors.onPrimary,
    fontWeight: "800",
    fontSize: 13,
  },

  linkButtonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },

  linkButtonGhostText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },

  emailLink: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.xl,
    fontWeight: "600",
  },

  /* ================= QR MODAL ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  qrModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl + 2,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadow.card,
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  closeButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  qrHeader: {
    alignItems: "center",
    marginTop: spacing.sm,
  },

  qrChaiCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    ...shadow.button,
  },

  qrChaiEmoji: {
    fontSize: 32,
  },

  qrTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },

  qrSubtitle: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 19,
    paddingHorizontal: spacing.xl,
  },

  qrContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    padding: spacing.md + 2,
    marginTop: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  qrImage: {
    width: 230,
    height: 230,
  },

  qrFooter: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  qrFooterText: {
    color: colors.textFaint,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
  },
});
