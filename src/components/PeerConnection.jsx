// import { STUN_SERVERS } from "../utils/stunServers"; // Import STUN_SERVERS

// class PeerConnection {
//   constructor(onIceCandidate, onDataChannel) {
//     console.log("Initializing PeerConnection...");

//     // Initialize peer connection with STUN servers
//     this.peer = new RTCPeerConnection({ iceServers: STUN_SERVERS });

//     // Handle ICE candidates
//     this.peer.onicecandidate = (event) => {
//       console.log("ICE candidate gathered:", event.candidate);
//       if (event.candidate) {
//         onIceCandidate(event.candidate); // Send candidate via signaling
//       }
//     };

//     // Handle incoming data channel
//     this.peer.ondatachannel = (event) => {
//       console.log("Data channel received:", event.channel);
//       onDataChannel(event.channel); // Handle incoming data channel
//     };

//     // Create local data channel
//     this.channel = this.peer.createDataChannel("fileTransfer");
//     this.channel.onopen = () => {
//       console.log("Data channel is open");
//     };
//     this.channel.onclose = () => {
//       console.log("Data channel is closed");
//     };
//     this.channel.onerror = (error) => {
//       console.error("Data channel error:", error);
//     };
//   }

//   // Create offer
//   async createOffer() {
//     console.log("Creating offer...");
//     if (this.peer.connectionState === "closed") {
//       console.error("Peer connection is closed, cannot create offer.");
//       return;
//     }

//     const offer = await this.peer.createOffer();
//     console.log("Offer created:", offer);
//     await this.peer.setLocalDescription(offer);
//     return offer;
//   }

//   // Handle received offer
//   async handleOffer(offer) {
//     console.log("Handling received offer:", offer);
//     if (this.peer.connectionState === "closed") {
//       console.error("Peer connection is closed, cannot handle offer.");
//       return;
//     }

//     await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await this.peer.createAnswer();
//     console.log("Answer created:", answer);
//     await this.peer.setLocalDescription(answer);
//     return answer;
//   }

//   // Handle received answer
//   async handleAnswer(answer) {
//     console.log("Handling received answer:", answer);
//     if (this.peer.connectionState === "closed") {
//       console.error("Peer connection is closed, cannot handle answer.");
//       return;
//     }

//     await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
//   }

//   // Handle ICE candidate
//   async handleCandidate(candidate) {
//     console.log("Handling ICE candidate:", candidate);
//     try {
//       if (this.peer.connectionState === "closed") {
//         console.error("Peer connection is closed, cannot handle candidate.");
//         return;
//       }

//       await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
//     } catch (error) {
//       console.error("Error adding ICE candidate:", error);
//     }
//   }

//   // Close the connection
//   close() {
//     console.log("Closing peer connection...");
//     if (this.peer) {
//       this.peer.close(); // Ensure closing is intentional
//       console.log("Peer connection closed.");
//     }
//   }
// }

// export default PeerConnection;


import { STUN_SERVERS } from "../utils/stunServers"; // Import STUN_SERVERS

class PeerConnection {
  constructor(onIceCandidate, onDataChannel) {
    console.log("Initializing PeerConnection...");

    // Initialize peer connection with STUN servers
    this.peer = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    // Store callbacks
    this.onIceCandidate = onIceCandidate;
    this.onDataChannel = onDataChannel;

    // Handle ICE candidates
    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate gathered:", event.candidate);
        this.onIceCandidate(event.candidate); // Send candidate via signaling
      } else {
        console.log("ICE gathering complete.");
      }
    };

    // Handle incoming data channel
    this.peer.ondatachannel = (event) => {
      console.log("Data channel received:", event.channel);
      this.channel = event.channel;
      this.setupDataChannel(this.channel);
      this.onDataChannel(this.channel); // Notify parent about the new data channel
    };

    // Create local data channel
    this.channel = this.peer.createDataChannel("fileTransfer");
    this.setupDataChannel(this.channel);
  }

  // Set up data channel event handlers
  setupDataChannel(channel) {
    channel.onopen = () => {
      console.log("Data channel is open");
    };
    channel.onclose = () => {
      console.log("Data channel is closed");
    };
    channel.onerror = (error) => {
      console.error("Data channel error:", error);
    };
    channel.onmessage = (event) => {
      console.log("Received message on data channel:", event.data);
    };
  }

  // Create offer
  async createOffer() {
    console.log("Creating offer...");
    try {
      if (this.peer.connectionState === "closed") {
        throw new Error("Peer connection is closed, cannot create offer.");
      }

      const offer = await this.peer.createOffer();
      console.log("Offer created:", offer);
      await this.peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  // Handle received offer
  async handleOffer(offer) {
    console.log("Handling received offer:", offer);
    try {
      if (this.peer.connectionState === "closed") {
        throw new Error("Peer connection is closed, cannot handle offer.");
      }

      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      console.log("Answer created:", answer);
      await this.peer.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error handling offer:", error);
      throw error;
    }
  }

  // Handle received answer
  async handleAnswer(answer) {
    console.log("Handling received answer:", answer);
    try {
      if (this.peer.connectionState === "closed") {
        throw new Error("Peer connection is closed, cannot handle answer.");
      }

      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Remote description set successfully.");
    } catch (error) {
      console.error("Error handling answer:", error);
      throw error;
    }
  }

  // Handle ICE candidate
  async handleCandidate(candidate) {
    console.log("Handling ICE candidate:", candidate);
    try {
      if (this.peer.connectionState === "closed") {
        throw new Error("Peer connection is closed, cannot handle candidate.");
      }

      await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added successfully.");
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
      throw error;
    }
  }

  // Close the connection
  close() {
    console.log("Closing peer connection...");
    if (this.peer) {
      this.peer.close();
      console.log("Peer connection closed.");
    }
    if (this.channel) {
      this.channel.close();
      console.log("Data channel closed.");
    }
  }
}

export default PeerConnection;