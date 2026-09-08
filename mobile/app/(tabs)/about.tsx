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
  email: "mailto:sagarpatole113@gmail.com",
  telegram: "https://t.me/+k9PS6QEejuIxZDBl",
};

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
          <Text style={styles.role}>Full Stack Developer</Text>
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
        {/* BUY ME A CHAI CARD */}
        <View style={styles.chaiCard}>
          <Pressable
            style={styles.chaiTapArea}
            onPress={() => setShowChaiQR(true)}
          >
            <View style={styles.chaiIconContainer}>
              <Text style={styles.chaiEmoji}>☕</Text>
            </View>
            <View style={styles.chaiContent}>
              <Text style={styles.chaiTitle}>Buy me a chai</Text>
              <Text style={styles.chaiText}>
                Support the free daily tests if you find them useful.
              </Text>
            </View>
            <View style={styles.scanBadge}>
              <Text style={styles.scanBadgeText}>SCAN</Text>
            </View>
          </Pressable>
        </View>

        <Pressable onPress={() => openLink(LINKS.email)}>
          <Text style={styles.emailLink}>Email me about a bug or suggestion</Text>
        </Pressable>

        <Pressable onPress={() => openLink(LINKS.telegram)}>
          <Text style={styles.telegramLink}>Join the Telegram group</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showChaiQR}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChaiQR(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModal}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowChaiQR(false)}
              accessibilityLabel="Close QR code"
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>

            <View style={styles.qrHeader}>
              <View style={styles.qrChaiCircle}>
                <Text style={styles.qrChaiEmoji}>☕</Text>
              </View>
              <Text style={styles.qrTitle}>Buy me a chai</Text>
              <Text style={styles.qrSubtitle}>
                Your support helps keep Saatatya free for students.
              </Text>
            </View>

            <View style={styles.qrContainer}>
              <Image
                source={require("../../assets/chai-qr.jpeg")}
                style={styles.qrImage}
              />
            </View>

            <View style={styles.qrFooter}>
              <Text style={styles.qrFooterText}>
                Payment is completely optional. Thank you for supporting the
                project.
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  header: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },

  profileImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },

  role: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "600",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: spacing.md,
  },

  bodyText: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 23,
  },

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

  emailLink: {
    color: colors.textDim,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.xl,
    fontWeight: "600",
  },

   telegramLink: {
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
